import { expose, Transfer } from 'threads/worker';
import {
  Data,
  DateMillisecond,
  Field,
  FixedSizeList,
  Float32,
  Float64,
  List,
  makeBuilder,
  makeData,
  Schema,
  Struct,
  Uint8
} from 'apache-arrow';
import { worker } from '@geoarrow/geoarrow-js';
import parquet from '@dsnp/parquetjs/dist/browser/parquet.cjs.js';
import { interpolateViridis, scaleSequential } from 'd3';

import {
  healpixId2CenterPoint,
  healpixId2PolygonCoordinates
} from '$utils/data/healpix';

const colorScale = scaleSequential([0, 0.0003], interpolateViridis);
const getColor = (v: number) => [...rgb2array(colorScale(v)), 255];

function rgb2array(hex: string) {
  return hex
    .substring(1)
    .match(/.{2}/g)!
    .map((v) => parseInt(v, 16));
}

function makeArrowPolygon(data, ringOffset: Uint32Array) {
  const count = ringOffset.length - 1;
  const coordsArray = new Float32Array(data);
  const polygonOffset = new Uint32Array(count + 1).map((_, i) => i);
  const coords = makeData({
    type: new Float32(),
    data: coordsArray
  });
  const vertices = makeData({
    type: new FixedSizeList(2, new Field('xy', coords.type, false)),
    child: coords
  });
  const rings = makeData({
    type: new List(new Field('vertices', vertices.type, false)),
    valueOffsets: ringOffset,
    child: vertices
  });

  return makeData({
    type: new List(new Field('rings', rings.type, false)),
    valueOffsets: polygonOffset,
    child: rings
  });
}

function makeStruct(data: [string, Data][]) {
  const schema = new Schema(
    data.map(([name, buffer]) => new Field(name, buffer.type))
  );

  const struct = makeData({
    type: new Struct(schema.fields),
    children: data.map(([, buffer]) => buffer)
  });

  return struct;
}

expose(async (url: string, nside: number) => {
  const reader = await parquet.ParquetReader.openUrl(url);
  const limit = null;

  // create a new cursor
  const cursor = reader.getCursor();
  const lineCount = limit || Number(reader.getRowCount());

  // eslint-disable-next-line no-console
  console.time(`compute (${lineCount}) polygons`);

  // Store for the whole data
  const allCoords: number[] = [];
  const ringOffset = new Uint32Array(lineCount + 1);
  ringOffset[0] = 0;
  const dateBuilder = makeBuilder({
    type: new DateMillisecond()
  });
  const allValues = new Float32Array(lineCount);
  const colors = new Uint8Array(lineCount * 4);

  // Store for the most probable track data.
  const mostProbCoords: number[] = [];
  const mostProbTemperature: number[] = [];
  const mostProbPressure: number[] = [];
  const mostProbDateBuilder = makeBuilder({
    type: new DateMillisecond()
  });
  const mostProbValues: number[] = [];

  let record;
  while ((record = await cursor.next())) {
    const i = cursor.cursorIndex - 1;
    if (limit && i >= limit) break;

    const time = Number(record.time) / 1e6;

    const polygonGeom = healpixId2PolygonCoordinates(record.cell_ids, nside);

    ringOffset[i + 1] = ringOffset[i] + polygonGeom.length;
    Array.prototype.push.apply(allCoords, polygonGeom.flat());
    dateBuilder.append(time);
    allValues[i] = record.states;
    colors.set(getColor(record.states), i * 4);

    if (record.temperature !== null && record.pressure !== null) {
      const pointCoords = healpixId2CenterPoint(record.cell_ids, nside);

      Array.prototype.push.apply(mostProbCoords, pointCoords.flat());
      mostProbTemperature.push(record.temperature);
      mostProbPressure.push(record.pressure);
      mostProbDateBuilder.append(time);
      mostProbValues.push(record.states);
    }
  }

  // Arrow: All
  const polygonArrow = makeArrowPolygon(allCoords, ringOffset);
  const datesArrow = dateBuilder.finish().flush();
  const valuesArrow = makeData({
    type: new Float32(),
    data: allValues
  });

  const colorChannels = makeData({
    type: new Uint8(),
    data: colors
  });

  const colorsArrow = makeData({
    type: new FixedSizeList(4, new Field('rgba', colorChannels.type, false)),
    child: colorChannels
  });

  const struct = makeStruct([
    ['date', datesArrow],
    ['geometry', polygonArrow],
    ['value', valuesArrow],
    ['color', colorsArrow]
  ]);

  //
  //
  // Arrow: Most probable
  const pointCoords = makeData({
    type: new Float32(),
    data: new Float32Array(mostProbCoords)
  });
  const mostProbPointArrow = makeData({
    type: new FixedSizeList(2, new Field('xy', pointCoords.type, false)),
    child: pointCoords
  });
  const mostProbDatesArrow = mostProbDateBuilder.finish().flush();
  const mostProbTemperatureArrow = makeData({
    type: new Float64(),
    data: new Float64Array(mostProbTemperature)
  });
  const mostProbPressureArrow = makeData({
    type: new Float64(),
    data: new Float64Array(mostProbPressure)
  });
  const mostProbValuesArrow = makeData({
    type: new Float32(),
    data: new Float32Array(mostProbValues)
  });

  const mostProbStruct = makeStruct([
    ['date', mostProbDatesArrow],
    ['geometry', mostProbPointArrow],
    ['value', mostProbValuesArrow],
    ['pressure', mostProbPressureArrow],
    ['temperature', mostProbTemperatureArrow]
  ]);

  // @ts-expect-error structData type error
  const [structPrep, structBuffArray] = worker.preparePostMessage(struct);
  const [mostProbStructPrep, mostProbStructBuffArray] =
    // @ts-expect-error structData type error
    worker.preparePostMessage(mostProbStruct);

  // eslint-disable-next-line no-console
  console.timeEnd(`compute (${lineCount}) polygons`);

  return Transfer(
    {
      data: structPrep,
      mostProbData: mostProbStructPrep
    },
    [...structBuffArray, ...mostProbStructBuffArray]
  );
});
