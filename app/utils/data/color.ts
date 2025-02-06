import { interpolateViridis, scaleSequential } from 'd3';

function rgb2array(hex: string) {
  return hex
    .substring(1)
    .match(/.{2}/g)!
    .map((v) => parseInt(v, 16));
}

export function getPDFColor(v: number, extent = [0, 0.0003]) {
  const scale = scaleSequential(extent, interpolateViridis);
  const color = scale(v);
  return [...rgb2array(color), 255];
}

export function getPDFColorLegend() {
  const scale = scaleSequential([0, 1], interpolateViridis);

  return Array.from(Array(15)).map((_, i) => {
    const v = i / 14;
    return { color: scale(v), value: v };
  });
}
