import React, { useEffect } from 'react';
import {
  Box,
  Flex,
  Select,
  Skeleton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs
} from '@chakra-ui/react';
import { CollecticonChevronLeftSmall } from '@devseed-ui/collecticons-chakra';
import { useQuery } from '@tanstack/react-query';

import { requestSpeciesArrowFn } from './data';

import SmartLink from '$components/common/smart-link';
import { PanelHeader } from '$components/common/panel-header';
import { getJsonFn, Species } from '$utils/api';
import { LegendBar } from '$components/common/legend-bar';
import { DataSectionHead } from '$components/common/data-section-head';
import { RouteErrorHandler } from '$components/common/error';
import { useSpeciesContext } from '$components/common/app-context';
import { getPDFColorLegend } from '$utils/data/color';
import { MdContent } from '$components/common/md-content';

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

  const { group, setGroup } = useSpeciesContext();

  const { data, isSuccess, error } = useQuery<Species>({
    queryKey: ['species', id],
    queryFn: getJsonFn(`/api/species/${id}.json`)
  });


  useEffect(() => {
    if (data?.groups?.length) {
      setGroup(data.groups[0]);
    }
  }, [data, setGroup]);

  const { error: dataError } = useQuery({
    enabled: !!group?.id,
    queryKey: ['species', id, 'arrow', group?.id],
    queryFn: requestSpeciesArrowFn(group?.file)
  });

  if (error || dataError) {
    return <RouteErrorHandler error={(error || dataError) as Error} />;
  }

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
      <Tabs size='sm' colorScheme='base' mx={-4} isLazy>
        <TabList>
          <Tab fontWeight='bold'>Visualize</Tab>
          <Tab fontWeight='bold'>Learn</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <LocationProbability />
            {data?.groups?.length ? (
              <Select
                mt={4}
                size='sm'
                value={group?.id}
                onChange={(e) => {
                  setGroup(
                    data.groups.find((g) => g.id === e.target.value) || null
                  );
                }}
              >
                {data.groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </Select>
            ) : null}
          </TabPanel>
          <TabPanel>
            <MdContent url={data?.descriptionMdSrc} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

function LocationProbability() {
  return (
    <Flex direction='column' gap={4}>
      <DataSectionHead
        title='Location Probability'
        unit='%'
        // onToggle={console.log}
      />
      <LegendBar stops={getColorLegend()} labels={['Less', 'More']} />
    </Flex>
  );
}
