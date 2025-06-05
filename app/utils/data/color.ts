import {
  interpolateInferno,
  interpolateViridis,
  scaleLinear,
  scaleLog,
  scaleSequential
} from 'd3';

/**
 * Converts a hexadecimal color string to an array of RGB values.
 *
 * @param hex - The hexadecimal color string (e.g., "#RRGGBB").
 * @returns An array of three numbers representing the RGB values.
 *
 * @example
 * ```typescript
 * const rgbArray = rgb2array("#ff5733");
 * console.log(rgbArray); // Output: [255, 87, 51]
 * ```
 */
export function rgb2array(hex: string) {
  return hex
    .substring(1)
    .match(/.{2}/g)!
    .map((v) => parseInt(v, 16));
}

/**
 * Generates a color with an alpha value based on the given parameters.
 *
 * @param value - The numeric value to map to a color.
 * @param extent - A tuple representing the minimum and maximum values for the color scale.
 * @param alphaRescale - A tuple representing the rescaling range for the alpha value.
 * @param alphaMax - The maximum alpha value (default is 255).
 * @returns An array representing the RGBA color.
 */
export function getAlphaColor(
  value: number,
  extent: [number, number],
  alphaRescale: [number, number],
  alphaMax = 255
) {
  const color = scaleSequential(extent, interpolateViridis);
  const [low, high] = alphaRescale;
  const [min, max] = extent;
  const diff = max - min;

  const alpha = scaleLinear(
    [min + diff * low, max - diff * (1 - high)],
    [0, alphaMax]
  ).clamp(true);

  return [...rgb2array(color(value)), alpha(value)];
}

/**
 * Computes the extent of an array of numerical values.
 * Computed this way instead of Math.min and Math.max because chrome only
 * handles a certain number of arguments.
 *
 * @param arr - An array of numbers.
 * @returns A tuple representing the minimum and maximum values in the input array.
 */
function getExtent(arr: ArrayLike<number>) {
  let len = arr.length;
  let max = -Infinity;
  let min = Infinity;

  while (len--) {
    max = arr[len] > max ? arr[len] : max;
    min = arr[len] < min ? arr[len] : min;
  }

  return [min, max];
}

/**
 * Computes a color buffer from an array of numerical values.
 *
 * @param values - An array of numbers representing the values to be converted
 * into colors.
 * @param colorFn - A function that takes a value and its extent, returning an
 * array representing the RGBA color for that value. Defaults to `getPDFColor`.
 * @returns A Uint8Array containing the color buffer, where each value is
 * represented by four bytes (RGBA).
 *
 * The function first calculates the minimum and maximum values from the input
 * array to determine the value extent. It then iterates over the input values,
 * converting each value to a color using the `colorFn` function and storing
 * the resulting color in the `colors` buffer.
 */
export function computeColorBuffer(
  values: ArrayLike<number>,
  colorFn = getPDFColor
) {
  const allValArray = Array.from(values);
  const colors = new Uint8Array(allValArray.length * 4);
  const valueExtent = getExtent(allValArray);

  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    colors.set(colorFn(v, valueExtent), i * 4);
  }

  return colors;
}

/**
 * Generates a color for a given value using a Viridis color scale.
 *
 * @param v - The value to be mapped to a color.
 * @param extent - The domain extent for the color scale. Defaults to [0, 0.0003].
 * @returns An array representing the RGBA color.
 */
export function getPDFColor(v: number, extent = [10e-7, 10e-3]) {
  const logValue = v ? scaleLog(extent, [0, 1]).base(Math.E)(v) : 0;
  const color = scaleSequential(interpolateViridis)(logValue);
  const alpha = scaleLinear([0, 0.3], [20, 255]).clamp(true)(logValue);
  return [...rgb2array(color), alpha];
}

/**
 * Generates a color for a given value using a Inferno color scale.
 *
 * @param v - The value to be mapped to a color.
 * @param extent - The domain extent for the color scale. Defaults to [0, 0.0003].
 * @returns An array representing the RGBA color.
 */
export function getDestineColor(v: number, extent: [number, number]) {
  const color = scaleSequential(extent, interpolateInferno)(v);
  return [...rgb2array(color), 255];
}

/**
 * Generates a color legend for a PDF using a d3 color scale.
 *
 * @returns An array of 15 ticks, each containing a color and its corresponding
 * value. The color is generated using the give color scale interpolator, and
 * the value ranges from 0 to 1.
 */
export function getColorLegend(interpolator = interpolateViridis) {
  const scale = scaleSequential([0, 1], interpolator);

  return Array.from(Array(15)).map((_, i) => {
    const v = i / 14;
    return { color: scale(v), value: v };
  });
}
