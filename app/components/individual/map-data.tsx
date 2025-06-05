import React, { useEffect, useMemo } from 'react';
import { useParams } from 'wouter';
import { useToken } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Layer, LngLatBoundsLike, Source, useMap } from 'react-map-gl';
import { GeoArrowSolidPolygonLayer } from '@geoarrow/deck.gl-layers';
import { DataFilterExtension } from '@deck.gl/extensions';
import bbox from '@turf/bbox';

import compassUrl from './compass.png';

import { requestIndividualArrowFn } from './data';
import { useIndividualContext } from '$components/common/app-context';
import { useMapImage } from '$utils/use-map-image-hook';
import { DeckGLOverlay } from '$components/common/deckgl-overlay';
import { MapLoadingIndicator } from '$components/common/map-loading-indicator';

export function IndividualPDF() {
  const { id } = useParams<{ id: string }>();
  const { currentPDFIndex } = useIndividualContext();

  const { data: rawArrowData, isLoading } = useQuery({
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

  return (
    <>
      <MapLoadingIndicator isLoading={isLoading} />
      <DeckGLOverlay layers={deckGlLayers} />
    </>
  );
}

export function IndividualLine() {
  const { id } = useParams<{ id: string }>();
  const [secondary500, secondary600] = useToken('colors', [
    'secondary.500',
    'secondary.600'
  ]);

  const map = useMap();

  useMapImage({
    url: compassUrl,
    name: 'compass'
  });

  const { data } = useQuery({
    enabled: !!id,
    queryKey: ['individual', id, 'arrow'],
    queryFn: requestIndividualArrowFn(id)
  });

  useEffect(() => {
    if (data?.line && map.current) {
      map.current?.fitBounds(bbox(data.line) as LngLatBoundsLike, {
        padding: { top: 200, bottom: 200, left: 100, right: 100 }
      });
    }
  }, [data?.line, map]);

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
