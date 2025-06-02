import React from 'react';
import {
  Badge,
  Box,
  Flex,
  Heading,
  Image,
  List,
  ListItem,
  Skeleton,
  Text
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';

import SmartLink from '$components/common/smart-link';
import { getJsonFn, SpeciesListed } from '$utils/api';
import { PanelHeader } from '$components/common/panel-header';
import { buildImgUrl } from '$utils/utils';

/**
 * Main Page component.
 */
export default function Component() {
  const { data, isSuccess } = useQuery<SpeciesListed[]>({
    queryKey: ['species'],
    queryFn: getJsonFn('/api/species/index.json')
  });

  return (
    <Flex direction='column' width='100%'>
      <PanelHeader
        suptitle='Explore'
        heading={
          <>
            Species{' '}
            {isSuccess && (
              <Badge
                bg='base.400a'
                color='surface.500'
                px={2}
                borderRadius='sm'
              >
                {data?.length.toString().padStart(2, '0')}
              </Badge>
            )}
          </>
        }
        borderBottom='1px'
        borderBottomColor='base.100a'
      />
      <List
        display='flex'
        flexDirection='column'
        gap={4}
        pt={4}
        overflowY='scroll'
      >
        {isSuccess
          ? data?.map((species) => (
              <ListItem key={species.id}>
                <SmartLink
                  to={`/species/${species.id}`}
                  display='flex'
                  gap={4}
                  alignItems='center'
                  color='inherit'
                  _hover={{ textDecor: 'none', bg: 'primary.100' }}
                  transition='background 320ms'
                  borderRadius='md'
                >
                  <Image
                    src={buildImgUrl(species.image)}
                    alt='Species'
                    borderRadius='md'
                    width={16}
                  />
                  <Box>
                    <Heading as='p' size='sm'>
                      {species.name}
                    </Heading>
                    <Text as='p' color='base.400'>
                      {species.region}
                    </Text>
                  </Box>
                </SmartLink>
              </ListItem>
            ))
          : [1, 2, 3].map((v) => (
              <ListItem key={v}>
                <Skeleton height={16} bg='base.200' />
              </ListItem>
            ))}
      </List>
    </Flex>
  );
}
