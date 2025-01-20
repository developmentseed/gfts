import React, { useMemo } from 'react';
import { useParams } from 'wouter';
import { useToken } from '@chakra-ui/react';
import { PointCloudLayer } from '@deck.gl/layers';
import { useQuery } from '@tanstack/react-query';
import { Layer, Source } from 'react-map-gl';
import { Feature, FeatureCollection, LineString, Point } from 'geojson';

import compassUrl from './compass.png';

import { requestIndividualParquetFn, useIndividualPDF } from './data';
import { useIndividualContext } from '$components/common/app-context';
import { getJsonFn } from '$utils/api';
import { useMapImage } from '$utils/use-map-image-hook';
import { DeckGLOverlay } from '$components/common/deckgl-overlay';

export function IndividualPDF() {
  const { id } = useParams<{ id: string }>();
  const { currentPDFIndex } = useIndividualContext();

  const { data: rawParquetData } = useQuery({
    enabled: !!id,
    queryKey: ['individual', id, 'parquet'],
    queryFn: requestIndividualParquetFn(id)
  });

  const individualPDF = useIndividualPDF(rawParquetData, [0, 0.25], 0.8);

  const deckGlLayers = useMemo(
    () =>
      individualPDF.map(
        (tsData, i) =>
          new PointCloudLayer({
            visible: currentPDFIndex === i,
            id: `point-${tsData[0].date.getTime()}`,
            data: tsData,
            getNormal: [0, 1, 0],
            getColor: (d) => d.color,
            getPosition: (d) => d.position,
            pointSize: 18e-3,
            sizeUnits: 'common'
          })
      ),
    [individualPDF, currentPDFIndex]
  );

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

  const { data } = useQuery<
    FeatureCollection<Point>,
    Error,
    Feature<LineString>
  >({
    enabled: !!id,
    queryKey: ['individual', id, 'geojson'],
    queryFn: getJsonFn(`/data/${id}/${id}.geojson`),
    select: (data) => ({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: data.features.map(
          (feature) => feature.geometry.coordinates
        )
      }
    })
  });

  return (
    <Source type='geojson' data={data}>
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
  );
}
