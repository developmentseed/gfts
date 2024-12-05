import React from 'react';
import {
  Box,
  Flex,
  Skeleton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs
} from '@chakra-ui/react';
import { CollecticonChevronLeftSmall } from '@devseed-ui/collecticons-chakra';
import { useQuery } from '@tanstack/react-query';

import SmartLink from '$components/common/smart-link';
import { PanelHeader } from '$components/common/panel-header';
import { getJsonFn, Species } from '$utils/api';
import { LegendBar } from '$components/common/legend-bar';
import { DataSectionHead } from '$components/common/data-section-head';

interface SpeciesComponentProps {
  params: {
    id: string;
  };
}

/**
 * Species component.
 */
export default function Component(props: SpeciesComponentProps) {
  const {
    params: { id }
  } = props;

  const { data, isSuccess } = useQuery<Species>({
    queryKey: ['species', id],
    queryFn: getJsonFn(`/api/species/${id}.json`)
  });

  return (
    <Box w='100%'>
      <PanelHeader
        suptitle='Explore'
        heading={
          isSuccess ? (
            <SmartLink
              to='/'
              display='flex'
              alignItems='center'
              color='inherit'
              gap={2}
              _hover={{ textDecor: 'none' }}
            >
              <CollecticonChevronLeftSmall /> {data?.name}
            </SmartLink>
          ) : (
            <Skeleton height={8} width='8rem' />
          )
        }
        subtitle={
          isSuccess ? (
            data?.region
          ) : (
            <Skeleton height={4} width='15rem' mt={1} as='span' />
          )
        }
      />
      <Tabs size='sm' colorScheme='base' mx={-4}>
        <TabList>
          <Tab fontWeight='bold'>Visualize</Tab>
          <Tab fontWeight='bold'>Learn</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <LocationProbability />
          </TabPanel>
          <TabPanel>
            <p>two!</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

function LocationProbability(props) {
  return (
    <Flex direction='column' gap={4}>
      <DataSectionHead
        title='Location Probability'
        unit='%'
        onToggle={console.log}
      />
      <LegendBar
        stops={[
          { color: '#000004', value: 0 },
          { color: '#0D0829', value: 7 },
          { color: '#280B54', value: 14 },
          { color: '#480B6A', value: 21 },
          { color: '#65156E', value: 28 },
          { color: '#82206C', value: 35 },
          { color: '#9F2A63', value: 42 },
          { color: '#BB3755', value: 49 },
          { color: '#D44842', value: 56 },
          { color: '#E8602D', value: 63 },
          { color: '#F57D15', value: 70 },
          { color: '#FB9E07', value: 77 },
          { color: '#FAC127', value: 84 },
          { color: '#F3E45C', value: 91 },
          { color: '#FCFFA4', value: 100 }
        ]}
      />
    </Flex>
  );
}
