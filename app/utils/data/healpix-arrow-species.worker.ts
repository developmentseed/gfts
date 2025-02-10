import { expose, Transfer } from 'threads/worker';
import { Field, FixedSizeList, Float32, makeData, Uint8 } from 'apache-arrow';
import { worker } from '@geoarrow/geoarrow-js';
import parquet from '@dsnp/parquetjs/dist/browser/parquet.cjs.js';

import { computeColorBuffer } from './color';
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
  const allValues = new Float32Array(lineCount);

  let record;
  while ((record = await cursor.next())) {
    const i = cursor.cursorIndex - 1;
    if (limit && i >= limit) break;

    const polygonGeom = healpixId2PolygonCoordinates(record.cell_ids, nside);

    ringOffset[i + 1] = ringOffset[i] + polygonGeom.length;
    Array.prototype.push.apply(allCoords, polygonGeom.flat());
    allValues[i] = record.states;
  }

  // Arrow: All
  const polygonArrow = makeArrowPolygon(allCoords, ringOffset);
  const valuesArrow = makeData({
    type: new Float32(),
    data: allValues
  });

  const colorChannels = makeData({
    type: new Uint8(),
    data: computeColorBuffer(allValues)
  });

  const colorsArrow = makeData({
    type: new FixedSizeList(4, new Field('rgba', colorChannels.type, false)),
    child: colorChannels
  });

  const struct = makeStruct([
    ['geometry', polygonArrow],
    ['value', valuesArrow],
    ['color', colorsArrow]
  ]);

  // @ts-expect-error structData type error
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
