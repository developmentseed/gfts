import parquet from '@dsnp/parquetjs/dist/browser/parquet.cjs.js';
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
        new URL(
          '../../utils/data/healpix-arrow-individual.worker.ts',
          // @ts-expect-error - This is a dynamic import.
          import.meta.url
        ),
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
      dates: mostProbableTable.getChild('date')!.toJSON() as number[],
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
