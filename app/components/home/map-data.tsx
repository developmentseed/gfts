import React from 'react';
import { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { chakra, Box, Heading, Image, Text, Flex } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';

import { getJsonFn, SpeciesListed } from '$utils/api';
import SmartLink from '$components/common/smart-link';

export function HomeMakers() {
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
