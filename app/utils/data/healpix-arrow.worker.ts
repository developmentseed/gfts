import { expose, Transfer } from 'threads/worker';
import { interpolateViridis, scaleSequential } from 'd3';

import { healpixId2PolygonCoordinates } from '$utils/data/healpix';

function rgb2array(hex: string) {
  return hex
    .substring(1)
    .match(/.{2}/g)!
    .map((v) => parseInt(v, 16));
}

expose(async (url: string, nside: number) => {
  const response = await fetch(url);
  const csv = await response.text();

  const lines = csv.split('\n');
  const lineCount = Math.ceil(lines.length);
  // const lineCount = Math.ceil(1);
  
  // eslint-disable-next-line no-console
  console.time(`compute (${lineCount}) polygons`);

  // Temp color function
  const colorScale = scaleSequential([0, lineCount - 1], interpolateViridis);
  const getColor = (i: number) => [...rgb2array(colorScale(i)), 255];
  // Temp color function

  const allCoords: number[] = [];
  const ringOffset = new Uint32Array(lineCount + 1);
  ringOffset[0] = 0;
  const colors = new Uint8Array(lineCount * 4);

  for (let i = 0; i < lineCount; i++) {
    const v = lines[i];
    const polygonGeom = healpixId2PolygonCoordinates(v, nside);

    ringOffset[i + 1] = ringOffset[i] + polygonGeom.length;
    Array.prototype.push.apply(allCoords, polygonGeom.flat());

    colors.set(getColor(i), i * 4);
  }
  // eslint-disable-next-line no-console
  console.timeEnd(`compute (${lineCount}) polygons`);

  const coords = new Float32Array(allCoords);

  const polygonOffset = new Uint32Array(lineCount + 1).map((_, i) => i);

  const buffers = [
    coords.buffer,
    ringOffset.buffer,
    polygonOffset.buffer,
    colors.buffer
  ];

  return Transfer({ coords, ringOffset, polygonOffset, colors }, buffers);
});
