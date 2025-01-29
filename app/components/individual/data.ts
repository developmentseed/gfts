import { useMemo } from 'react';
import parquet from '@dsnp/parquetjs/dist/browser/parquet.cjs.js';
import { scaleSequential, interpolateViridis, scaleLinear, extent } from 'd3';
import { spawn } from 'threads';
import { Feature, LineString } from 'geojson';

import { IndividualParquetItem } from '$utils/api';
import {
  HealpixArrowData,
  HealpixArrowMostProbData,
  HealpixWorker,
  makeHealpixArrowTable
} from '$utils/data/healpix';

export interface IndividualPDFPoint {
  position: number[];
  color: number[];
  date: Date;
  value: number;
}

export type IndividualPDFTimestep = IndividualPDFPoint[];
export type IndividualPDF = IndividualPDFTimestep[];

export function requestIndividualParquetFn(id: string) {
  return async () => {
    const reader = await parquet.ParquetReader.openUrl(
      `${process.env.DATA_API}/data/${id}/${id}.parquet`
    );

    // create a new cursor
    const cursor = reader.getCursor();

    // read all records from the file.
    const data: Record<string, IndividualParquetItem[]> = {};
    let record;
    while ((record = await cursor.next())) {
      const ts = Number(record.time) / 1e6;

      data[ts] = data[ts] || [];

      // eslint-disable-next-line
      data[ts].push({
        value: Number(record.states),
        date: new Date(ts),
        longitude: record.longitude / 1e6,
        latitude: record.latitude / 1e6
      });
    }
    return data;
  };
}

export function requestIndividualArrowFn(id: string) {
  return async () => {
    const url = `${process.env.DATA_API}/data/${id}/${id}_healpix.parquet`;
    const nside = 4096;

    const healpixWorker = await spawn<HealpixWorker>(
      new Worker(
        // @ts-expect-error - This is a dynamic import.
        new URL('../../utils/data/healpix-arrow.worker.ts', import.meta.url),
        {
          type: 'module'
        }
      )
    );

    const healpixData = await healpixWorker(url, nside);
    const arrowTable = makeHealpixArrowTable<HealpixArrowData>(
      healpixData.data
    );

    const mostProbableTable = makeHealpixArrowTable<HealpixArrowMostProbData>(
      healpixData.mostProbData
    );

    return {
      mostProbableTable,
      table: arrowTable,
      dates: mostProbableTable.getChild('date')!.toJSON(),
      line: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: mostProbableTable
            .getChild('geometry')!
            .toJSON()
            .map((v) => v!.toJSON())
        }
      } as Feature<LineString>
    };
  };
}

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
function rgb2array(hex: string) {
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
function getAlphaColor(
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
 * Prepares a timestep of the Probability Density Function (PDF) from the given
 * raw parquet data.
 *
 * @param data - Raw parquet data for a single timestep.
 * @param alphaRescale - A rescaling factor for the alpha value.
 * @param alphaMax - The maximum alpha value.
 *
 * @returns An array of `IndividualPDFTimestep` objects with the processed data.
 */
export function preparePDFTimestep(
  data: IndividualParquetItem[],
  alphaRescale,
  alphaMax
): IndividualPDFTimestep {
  const datExtent = extent(data, (d) => d.value) as [number, number];

  return data.map((v) => ({
    position: [v.longitude, v.latitude, 1],
    value: v.value,
    date: v.date,
    color: getAlphaColor(v.value, datExtent, alphaRescale, alphaMax * 255)
  }));
}

/**
 * Generates an individual's Probability Density Function (PDF) using the
 * provided raw data and alpha rescale parameters.
 *
 * @param rawData - RAw parquet data for the individual.
 * @param alphaRescale - A tuple containing the minimum and maximum values for
 * alpha rescaling.
 * @param alphaMax - The maximum alpha value.
 *
 * @returns The individual's Probability Density Function (PDF)
 */
export function useIndividualPDF(
  rawData: Record<string, IndividualParquetItem[]> | undefined,
  alphaRescale: [number, number],
  alphaMax: number
): IndividualPDF {
  const [rMin, rMax] = alphaRescale;

  return useMemo(() => {
    if (!rawData) return [];

    return Object.values(rawData).map((timestepData) =>
      preparePDFTimestep(timestepData, [rMin, rMax], alphaMax)
    );
  }, [rawData, rMin, rMax, alphaMax]);
}
