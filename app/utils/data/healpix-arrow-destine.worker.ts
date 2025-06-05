import { expose, Transfer } from 'threads/worker';
import {
  Field,
  FixedSizeList,
  Float32,
  Int16,
  makeData,
  Uint8
} from 'apache-arrow';
import { worker } from '@geoarrow/geoarrow-js';
import parquet from '@dsnp/parquetjs/dist/browser/parquet.cjs.js';

import { computeColorBuffer, getDestineColor } from './color';
import { makeArrowPolygon, makeStruct } from './arrow';
import { healpixId2PolygonCoordinates } from '$utils/data/healpix';

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
  const year = new Int16Array(lineCount);
  const temperature = new Float32Array(lineCount);
  const salinity = new Float32Array(lineCount);

  let record;
  while ((record = await cursor.next())) {
    const i = cursor.cursorIndex - 1;
    if (limit && i >= limit) break;

    const polygonGeom = healpixId2PolygonCoordinates(record.cell_ids, nside);

    ringOffset[i + 1] = ringOffset[i] + polygonGeom.length;
    Array.prototype.push.apply(allCoords, polygonGeom.flat());
    temperature[i] = record.avg_tos;
    salinity[i] = record.avg_sos;
    year[i] = Number(record.year);
  }

  // Arrow: All
  const polygonArrow = makeArrowPolygon(allCoords, ringOffset);
  const yearArrow = makeData({
    type: new Int16(),
    data: year
  });
  const temperatureArrow = makeData({
    type: new Float32(),
    data: temperature
  });

  const temperatureColorChannels = makeData({
    type: new Uint8(),
    data: computeColorBuffer(temperature, getDestineColor)
  });

  const temperatureColorsArrow = makeData({
    type: new FixedSizeList(
      4,
      new Field('rgba', temperatureColorChannels.type, false)
    ),
    child: temperatureColorChannels
  });

  const salinityArrow = makeData({
    type: new Float32(),
    data: salinity
  });

  const salinityColorChannels = makeData({
    type: new Uint8(),
    data: computeColorBuffer(salinity, getDestineColor)
  });

  const salinityColorsArrow = makeData({
    type: new FixedSizeList(
      4,
      new Field('rgba', salinityColorChannels.type, false)
    ),
    child: salinityColorChannels
  });

  const struct = makeStruct([
    ['geometry', polygonArrow],
    ['year', yearArrow],
    ['temperature', temperatureArrow],
    ['temperatureColor', temperatureColorsArrow],
    ['salinity', salinityArrow],
    ['salinityColor', salinityColorsArrow]
  ]);

  const [structPrep, structBuffArray] = worker.preparePostMessage(struct);

  // eslint-disable-next-line no-console
  console.timeEnd(`compute (${lineCount}) polygons`);

  return Transfer(
    {
      data: structPrep
    },
    [...structBuffArray]
  );
});
