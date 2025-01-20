import React, { useState } from 'react';
import { Layer, Map as ReactMap, Source } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Box } from '@chakra-ui/react';
import { Route } from 'wouter';
import { HomeMakers } from '$components/home/map-data';
import { IndividualLine, IndividualPDF } from '$components/individual/map-data';
import { SpeciesPDF } from '$components/species/map-data';

export default function MbMap() {
  const [viewStateMap, setViewState] = useState({
    longitude: -30.4742,
    latitude: 40.64983,
    zoom: 4,
    pitch: 0
  });

  return (
    <Box>
      <Box position='absolute' inset={0}>
        <ReactMap
          {...viewStateMap}
          mapboxAccessToken={process.env.MAPBOX_TOKEN!}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle='mapbox://styles/devseed/cm47tdpmx00e101r159yt4ogi'
        >
          <Source
            type='raster'
            id='bathymetry'
            tiles={[
              'https://tiles.emodnet-bathymetry.eu/2020/baselayer/web_mercator/{z}/{x}/{y}.png'
            ]}
          >
            <Layer
              type='raster'
              id='bathymetry'
              beforeId='country-boundaries'
            />
          </Source>

          <Route path='/'>
            <HomeMakers />
          </Route>

          <Route path='/individual/:id'>
            <IndividualPDF />
            <IndividualLine />
          </Route>

          <Route path='/species/:id'>
            <SpeciesPDF />
          </Route>
        </ReactMap>
      </Box>
    </Box>
  );
}
