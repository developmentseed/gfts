import React, { useMemo } from 'react';
// import { GeoArrowSolidPolygonLayer } from '@geoarrow/deck.gl-layers';
// import { DataFilterExtension } from '@deck.gl/extensions';
import { useQuery } from '@tanstack/react-query';
import { spawn } from 'threads';

import {
  HealpixArrowData,
  HealpixWorker,
  makeHealpixArrowTable
} from '$utils/data/healpix';
import { DeckGLOverlay } from '$components/common/deckgl-overlay';

export function SpeciesPDF() {
  const { data } = useQuery({
    queryKey: ['individual', 'healpix'],
    queryFn: async () => {
      const url = `${process.env.DATA_API}/data/gfts_AD_A11146.parquet`;
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

      return arrowTable;
    }
  });

  const deckGlLayers = useMemo(
    () =>
      data?.getChild
        ? [
            // new GeoArrowSolidPolygonLayer({
            //   id: 'geoarrow-polygons',
            //   data: data,
            //   getPolygon: data.getChild('geometry')!,
            //   _normalize: false,
            //   getFillColor: ({ index, data }) => {
            //     const value = data.data.getChild('value')!.get(index);
            //     return getColor(value);
            //   },

            //   getFilterValue: (_, { index, data }) => {
            //     // console.log('d', new Date(data.data.getChild('date')!.get(index)));
            //     return data.data.getChild('date')!.get(index);
            //   },
            //   filterRange: [1439424000000, 1439510400000],

            //   extensions: [new DataFilterExtension()]
            // })
          ]
        : [],
    [data]
  );

  return <DeckGLOverlay layers={deckGlLayers} />;
}
