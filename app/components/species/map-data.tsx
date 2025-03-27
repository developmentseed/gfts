import React, { useEffect, useMemo } from 'react';
import { useParams } from 'wouter';
import { GeoArrowSolidPolygonLayer } from '@geoarrow/deck.gl-layers';
import { useQuery } from '@tanstack/react-query';
import { useMap } from 'react-map-gl';

import { requestSpeciesArrowFn } from './data';

import { DeckGLOverlay } from '$components/common/deckgl-overlay';
import { useSpeciesContext } from '$components/common/app-context';
import { getJsonFn, Species } from '$utils/api';
import { MapLoadingIndicator } from '$components/common/map-loading-indicator';

export function SpeciesPDF() {
  const { id } = useParams<{ id: string }>();
  const { group } = useSpeciesContext();
  const map = useMap();

  const { data } = useQuery<Species>({
    queryKey: ['species', id],
    queryFn: getJsonFn(`/api/species/${id}.json`)
  });

  useEffect(() => {
    if (data) {
      map.current?.panTo(data.coords, { offset: [200, 0] });
    }
  }, [data, map]);

  const { data: rawArrowData, isLoading } = useQuery({
    enabled: !!group?.id,
    queryKey: ['species', id, 'arrow', group?.id],
    queryFn: requestSpeciesArrowFn(group?.file)
  });

  const deckGlLayers = useMemo(() => {
    if (!rawArrowData?.table || !group?.id) {
      return [];
    }

    return [
      new GeoArrowSolidPolygonLayer({
        id: `geoarrow-species-polygons-${group.id}`,
        data: rawArrowData.table,
        getPolygon: rawArrowData.table.getChild('geometry')!,
        _normalize: false,
        getFillColor: rawArrowData.table.getChild('color')!
      })
    ];
  }, [rawArrowData, group?.id]);

  return (
    <>
      <MapLoadingIndicator isLoading={isLoading} />
      <DeckGLOverlay layers={deckGlLayers} />
    </>
  );
}
