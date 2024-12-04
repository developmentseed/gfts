import React, { useState } from 'react';
import { Layer, Marker, Map as ReactMap, Source } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { chakra, Box, Heading, Image, Text, Flex } from '@chakra-ui/react';
import { Route } from 'wouter';
import { useQuery } from '@tanstack/react-query';

import SmartLink from './smart-link';

import { getJsonFn, SpeciesListed } from '$utils/api';

export default function MbMap() {
  const [viewStateMap, setViewState] = useState({
    longitude: -3.4742,
    latitude: 46.64983,
    zoom: 6,
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
        </ReactMap>
      </Box>
    </Box>
  );
}

function HomeMakers() {
  const { data, isSuccess } = useQuery<SpeciesListed[]>({
    queryKey: ['species'],
    queryFn: getJsonFn('/api/species/index.json')
  });

  if (isSuccess) {
    return data?.map((species) => (
      <Marker
        key={species.id}
        longitude={species.coords[0]}
        latitude={species.coords[1]}
        anchor='bottom'
      >
        <Flex direction='column' alignItems='center'>
          <SmartLink
            to={`/species/${species.id}`}
            display='flex'
            gap={4}
            alignItems='center'
            color='inherit'
            _hover={{ textDecor: 'none', bg: 'primary.100' }}
            bg='surface.500'
            borderRadius='md'
            pr={4}
            boxShadow='md'
          >
            <Image
              src={species.image}
              alt='Species'
              borderRadius='md'
              width={16}
            />
            <Box>
              <Heading as='p' size='sm'>
                {species.name}
              </Heading>
              <Text as='p' color='base.400' fontSize='sm'>
                {species.region}
              </Text>
            </Box>
          </SmartLink>
          <chakra.svg height='8px' width='16px'>
            <polygon points='0,0 8,8 16,0' fill='white' />
          </chakra.svg>
        </Flex>
      </Marker>
    ));
  }

  return null;
}
