import React, { useMemo } from 'react';
import { GeoArrowSolidPolygonLayer } from '@geoarrow/deck.gl-layers';
import { useQuery } from '@tanstack/react-query';
import { spawn } from 'threads';

import { HealpixWorker, makeHealpixArrowTable } from '$utils/data/healpix';
import { DeckGLOverlay } from '$components/common/deckgl-overlay';

export function SpeciesPDF() {
  const { data } = useQuery({
    queryKey: ['individual', 'healpix'],
    queryFn: async () => {
      const url = `${process.env.DATA_API}/healpix_cellids.csv?`;
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

      try {
        const healpixData = await healpixWorker(url, nside);

        return makeHealpixArrowTable(healpixData);
      } catch (error) {
        console.log('error', error);
      }
    }
  });

  const deckGlLayers = useMemo(
    () =>
      data?.getChild
        ? [
            new GeoArrowSolidPolygonLayer({
              id: 'geoarrow-polygons',
              data: data,
              getPolygon: data.getChild('geometry')!,
              _normalize: false,
              getFillColor: data.getChild('colors')!
            })
          ]
        : [],
    [data]
  );

  return <DeckGLOverlay layers={deckGlLayers} />;
}
