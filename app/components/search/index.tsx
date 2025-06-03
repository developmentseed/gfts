import React from 'react';
import { useLocation } from 'wouter';
import { Badge, Box, Flex, Heading } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Select } from 'chakra-react-select';

import { PanelHeader } from '$components/common/panel-header';
import { getJsonFn, IndividualListed } from '$utils/api';
import { RouteErrorHandler } from '$components/common/error';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

const formatGroupLabel = (data) => (
  <Heading
    size='xs'
    color='base.400'
    display='flex'
    justifyContent='space-between'
    gap={4}
  >
    {data.label}
    <Badge bg='base.400a' color='surface.500' px={2} borderRadius='sm'>
      {data?.options.length.toString().padStart(2, '0')}
    </Badge>
  </Heading>
);

/**
 * Search Page component.
 */
export default function Component() {
  const [, navigate] = useLocation();

  const { data, error } = useQuery<
    IndividualListed[],
    Error,
    SelectOptionGroup[]
  >({
    queryKey: ['individuals'],
    queryFn: getJsonFn(`/api/individual/index.json`),
    select(data) {
      const groups = data.reduce<Record<string, IndividualListed[]>>(
        (acc, individual) => {
          const species = individual.species || 'Unknown';

          return {
            ...acc,
            [species]: [...(acc[species] || []), individual]
          };
        },
        {}
      );

      return Object.entries(groups).map(([species, individuals]) => ({
        label: species,
        options: individuals.map((individual) => ({
          label: individual.id,
          value: individual.id
        }))
      }));
    }
  });

  if (error) {
    return <RouteErrorHandler error={error} />;
  }

  return (
    <Flex direction='column' width='100%'>
      <PanelHeader
        suptitle='Explore'
        heading='Individuals'
        borderBottom='1px'
        borderBottomColor='base.100a'
      />
      <Box mt={4}>
        {data && (
          <Select
            options={data}
            size='sm'
            selectedOptionColorScheme='primary'
            focusBorderColor='primary.500'
            formatGroupLabel={formatGroupLabel}
            onChange={(option: SelectOption) => {
              option && navigate(`/individual/${option.value}`);
            }}
          />
        )}
      </Box>
    </Flex>
  );
}
