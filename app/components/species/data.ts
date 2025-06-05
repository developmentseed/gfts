import { spawn, Thread } from 'threads';

import {
  HealpixArrowData,
  HealpixArrowDestineData,
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

export function requestSpeciesArrowFn(file?: string) {
  return async () => {
    const url = `${process.env.DATA_API}${file}`;
    const nside = 4096;

    const healpixWorker = await spawn<HealpixWorker>(
      new Worker(
        new URL(
          '../../utils/data/healpix-arrow-species.worker.ts',
          import.meta.url
        ),
        {
          type: 'module'
        }
      )
    );

    const healpixData = await healpixWorker(url, nside);
    await Thread.terminate(healpixWorker);
    const table = makeHealpixArrowTable<HealpixArrowData>(healpixData.data);

    return { table };
  };
}

export function requestDestineArrowFn(file?: string) {
  return async () => {
    const url = `${process.env.DATA_API}${file}`;
    const nside = 1024;

    const healpixWorker = await spawn<HealpixWorker>(
      new Worker(
        new URL(
          '../../utils/data/healpix-arrow-destine.worker.ts',
          import.meta.url
        ),
        {
          type: 'module'
        }
      )
    );

    const healpixData = await healpixWorker(url, nside);
    await Thread.terminate(healpixWorker);
    const table = makeHealpixArrowTable<HealpixArrowDestineData>(healpixData.data);

    return { table };
  };
}

export interface CsvChartDataVariable {
  year: number;
  value: number;
  min: number;
  max: number;
}

export interface CsvChartData {
  [key: string]: CsvChartQuarterData;
}
export interface CsvChartQuarterData {
  quarter: string;
  temperature: CsvChartDataVariable[];
  salinity: CsvChartDataVariable[];
}

export function selectCsvChartData(data: any[]) {
  return data.reduce<CsvChartData>((acc, item) => {
    const q = `q${item.quarter}`;
    const temp = {
      year: item.year,
      value: item.weighted_avg_tos,
      min: item.weighted_avg_tos - item.weighted_std_tos,
      max: item.weighted_avg_tos + item.weighted_std_tos
    };
    const salinity = {
      year: item.year,
      value: item.weighted_avg_sos,
      min: item.weighted_avg_sos - item.weighted_std_sos,
      max: item.weighted_avg_sos + item.weighted_std_sos
    };
    if (!acc[q]) {
      return {
        ...acc,
        [q]: { quarter: q, temperature: [temp], salinity: [salinity] }
      };
    } else {
      return {
        ...acc,
        [q]: {
          ...acc[q],
          temperature: [...acc[q].temperature, temp],
          salinity: [...acc[q].salinity, salinity]
        }
      };
    }
  }, {});
}
