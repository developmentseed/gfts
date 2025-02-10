import { expose, Transfer } from 'threads/worker';
import {
  DateMillisecond,
  Field,
  FixedSizeList,
  Float32,
  Float64,
  makeBuilder,
  makeData,
  Uint8
} from 'apache-arrow';
import { worker } from '@geoarrow/geoarrow-js';
import parquet from '@dsnp/parquetjs/dist/browser/parquet.cjs.js';

import { getPDFColor } from './color';
import { makeArrowPolygon, makeStruct } from './arrow';
import {
  healpixId2CenterPoint,
  healpixId2PolygonCoordinates
} from '$utils/data/healpix';

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

  let colorCalcState = {
    prevTime: null as number | null,
    minMaxForTime: [0, 0],
    startIndex: 0
  };

  let record;
  while ((record = await cursor.next())) {
    const i = cursor.cursorIndex - 1;
    if (limit && i >= limit) break;

    const time = Number(record.time) / 1e6;

    // Calculate colors for the previous time step.
    // We assume the records are sorted by time, so when the time changes,
    // we calculate the colors for the previous time step.
    if (i === 0) {
      // Initialize the color calculation state.
      colorCalcState = {
        prevTime: time,
        minMaxForTime: [record.states, record.states],
        startIndex: 0
      };
    } else if (colorCalcState.prevTime !== time) {
      const { minMaxForTime, startIndex } = colorCalcState;

      // Calculate the colors for the previous time step.
      for (let j = startIndex; j < i; j++) {
        const color = getPDFColor(allValues[j], minMaxForTime);
        colors.set(color, j * 4);
      }

      // Update the color calculation state.
      colorCalcState = {
        prevTime: time,
        minMaxForTime: [record.states, record.states],
        startIndex: i
      };
    } else {
      colorCalcState.minMaxForTime = [
        Math.min(colorCalcState.minMaxForTime[0], record.states),
        Math.max(colorCalcState.minMaxForTime[1], record.states)
      ];
    }

    const polygonGeom = healpixId2PolygonCoordinates(record.cell_ids, nside);

    ringOffset[i + 1] = ringOffset[i] + polygonGeom.length;
    Array.prototype.push.apply(allCoords, polygonGeom.flat());
    dateBuilder.append(time);
    allValues[i] = record.states;

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
