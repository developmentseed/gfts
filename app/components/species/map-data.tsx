import React, { useEffect, useMemo } from 'react';
import { useParams } from 'wouter';
import { DataFilterExtension } from '@deck.gl/extensions';
import { GeoArrowSolidPolygonLayer } from '@geoarrow/deck.gl-layers';
import { useQuery } from '@tanstack/react-query';
import { useMap } from 'react-map-gl';

import { requestDestineArrowFn, requestSpeciesArrowFn } from './data';

import { DeckGLOverlay } from '$components/common/deckgl-overlay';
import { useSpeciesContext } from '$components/common/app-context';
import { getJsonFn, Species } from '$utils/api';
import { MapLoadingIndicator } from '$components/common/map-loading-indicator';
import { useKeycloak } from '$components/auth/context';

export function SpeciesPDF() {
  const { id } = useParams<{ id: string }>();
  const { hasDPADAccess } = useKeycloak();
  const { group, destineLayer, destineYear } = useSpeciesContext();
  const map = useMap();

  const { data } = useQuery<Species>({
    queryKey: ['species', id],
    queryFn: getJsonFn(`/api/species/${id}.json`)
  });

  useEffect(() => {
    if (data) {
      map.current?.flyTo({
        center: data.coords,
        zoom: 6
      });
    }
  }, [data, map]);

  const { data: rawArrowData, isLoading } = useQuery({
    enabled: !!group?.id,
    queryKey: ['species', id, 'arrow', group?.id],
    queryFn: requestSpeciesArrowFn(group?.file)
  });

  const destineDataEnabled = !!group?.id && hasDPADAccess && !!destineLayer;
  const { data: destineArrowData, isLoading: isDestineLoading } = useQuery({
    enabled: destineDataEnabled,
    queryKey: ['species', id, 'arrow-destine', group?.id],
    queryFn: requestDestineArrowFn(
      `/destine/ifs-nemo-seasonal-${group?.id}.parquet`
    )
  });

  const isDestineDataLoading = destineDataEnabled && isDestineLoading;

  const deckGlLayers = useMemo(() => {
    if (!group?.id) {
      return [];
    }

    const speciesGlLayer = rawArrowData?.table
      ? [
          new GeoArrowSolidPolygonLayer({
            id: `geoarrow-species-polygons-${group.id}`,
            data: rawArrowData.table,
            getPolygon: rawArrowData.table.getChild('geometry')!,
            _normalize: false,
            getFillColor: rawArrowData.table.getChild('color')!
          })
        ]
      : [];

    const destineGlLayer =
      destineLayer && destineYear && destineArrowData?.table
        ? [
            new GeoArrowSolidPolygonLayer({
              id: `geoarrow-destine-polygons-${group.id}`,
              data: destineArrowData.table,
              getPolygon: destineArrowData.table.getChild('geometry')!,
              _normalize: false,
              getFillColor: destineArrowData.table.getChild(
                `${destineLayer}Color`
              )!,

              getFilterValue: (_, { index, data }) => {
                return data.data.getChild('year')!.get(index);
              },
              filterRange: [destineYear, destineYear + 0.1],
              extensions: [new DataFilterExtension()]
            })
          ]
        : [];

    return [...destineGlLayer, ...speciesGlLayer];
  }, [rawArrowData, destineArrowData, group?.id, destineLayer, destineYear]);

  return (
    <>
      <MapLoadingIndicator isLoading={isLoading || isDestineDataLoading} />
      <DeckGLOverlay layers={deckGlLayers} />
    </>
  );
}
