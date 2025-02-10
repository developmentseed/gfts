import { spawn } from 'threads';

import {
  HealpixArrowData,
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
          // @ts-expect-error - This is a dynamic import.
          import.meta.url
        ),
        {
          type: 'module'
        }
      )
    );

    const healpixData = await healpixWorker(url, nside);
    const table = makeHealpixArrowTable<HealpixArrowData>(healpixData.data);

    return { table };
  };
}
