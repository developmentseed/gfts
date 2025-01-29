import React, { useMemo } from 'react';
import { useParams } from 'wouter';
import { useToken } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Layer, Source } from 'react-map-gl';
import { GeoArrowSolidPolygonLayer } from '@geoarrow/deck.gl-layers';
import { DataFilterExtension } from '@deck.gl/extensions';

import compassUrl from './compass.png';

import { requestIndividualArrowFn } from './data';
import { useIndividualContext } from '$components/common/app-context';
import { useMapImage } from '$utils/use-map-image-hook';
import { DeckGLOverlay } from '$components/common/deckgl-overlay';

export function IndividualPDF() {
  const { id } = useParams<{ id: string }>();
  const { currentPDFIndex } = useIndividualContext();

  const { data: rawArrowData } = useQuery({
    enabled: !!id,
    queryKey: ['individual', id, 'arrow'],
    queryFn: requestIndividualArrowFn(id)
  });

  const deckGlLayers = useMemo(() => {
    if (!rawArrowData?.table || !rawArrowData?.dates) {
      return [];
    }

    const dateMillis = rawArrowData.dates[currentPDFIndex]!;
    return [
      new GeoArrowSolidPolygonLayer({
        id: 'geoarrow-polygons',
        data: rawArrowData.table,
        // @ts-expect-error is not assignable to type 'undefined'
        getPolygon: rawArrowData.table.getChild('geometry')!,
        _normalize: false,
        getFillColor: rawArrowData.table.getChild('color')!,

        getFilterValue: (_, { index, data }) => {
          return data.data.getChild('date')!.get(index);
        },
        filterRange: [dateMillis, dateMillis + 1],
        extensions: [new DataFilterExtension()]
      })
    ];
  }, [rawArrowData, currentPDFIndex]);

  return <DeckGLOverlay layers={deckGlLayers} />;
}

export function IndividualLine() {
  const { id } = useParams<{ id: string }>();
  const [secondary500, secondary600] = useToken('colors', [
    'secondary.500',
    'secondary.600'
  ]);

  useMapImage({
    url: compassUrl,
    name: 'compass'
  });

  const { data } = useQuery({
    enabled: !!id,
    queryKey: ['individual', id, 'arrow'],
    queryFn: requestIndividualArrowFn(id)
  });

  return data?.line ? (
    <Source type='geojson' data={data.line}>
      <Layer
        type='line'
        id='individual-line'
        paint={{ 'line-color': secondary500, 'line-width': 2 }}
      />
      <Layer
        id='individual-line-dir'
        type='symbol'
        minzoom={6}
        layout={{
          'icon-image': 'compass',
          'icon-size': ['interpolate', ['linear'], ['zoom'], 6, 0.17, 10, 0.3],
          'icon-rotate': 90,
          'symbol-placement': 'line',
          'icon-rotation-alignment': 'map',
          'symbol-spacing': ['interpolate', ['linear'], ['zoom'], 6, 1, 10, 20]
        }}
        paint={{
          'icon-color': secondary600
        }}
      />
    </Source>
  ) : null;
}
