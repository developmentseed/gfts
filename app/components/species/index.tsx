import React, { Suspense, useEffect } from 'react';
import {
  Box,
  Divider,
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
import { Table } from 'apache-arrow';
import { extent } from 'd3';

import {
  requestDestineArrowFn,
  requestSpeciesArrowFn,
  selectCsvChartData
} from './data';

import SmartLink from '$components/common/smart-link';
import { PanelHeader } from '$components/common/panel-header';
import { getCsvFn, getJsonFn, Species } from '$utils/api';
import { LegendBar } from '$components/common/legend-bar';
import { DataSectionHead } from '$components/common/data-section-head';
import { RouteErrorHandler } from '$components/common/error';
import { useSpeciesContext } from '$components/common/app-context';
import { getColorLegend } from '$utils/data/color';
import { MdContent } from '$components/common/md-content';
import { HealpixArrowDestineData } from '$utils/data/healpix';
import { useKeycloak } from '$components/auth/context';

const ChartsSection = React.lazy(() => import('./charts'));

interface SpeciesComponentProps {
  params: {
    id: string;
  };
}

function getDataExtent(data: Table<HealpixArrowDestineData>) {
  const temperature = data.getChild('temperature')!.toArray();
  const salinity = data.getChild('salinity')!.toArray();

  return {
    temperature: extent(temperature) as [number, number],
    salinity: extent(salinity) as [number, number]
  };
}

/**
 * Species component.
 */
export default function Component(props: SpeciesComponentProps) {
  const {
    params: { id }
  } = props;
  const { hasDPADAccess } = useKeycloak();
  const { group, setGroup, setDestineYear, destineLayer } = useSpeciesContext();


  const { data, isSuccess, error } = useQuery<Species>({
    queryKey: ['species', id],
    queryFn: getJsonFn(`/api/species/${id}.json`)
  });

  const { data: seasonalData } = useQuery({
    enabled: hasDPADAccess,
    queryKey: ['species', id, 'csv'],
    queryFn: getCsvFn(`/destine/ifs-nemo-${id}-weighted-seasonal.csv`),
    select: selectCsvChartData
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

  const destineDataEnabled = !!group?.id && hasDPADAccess && !!destineLayer;
  const { data: destineArrowData } = useQuery({
    enabled: destineDataEnabled,
    queryKey: ['species', id, 'arrow-destine', group?.id],
    queryFn: requestDestineArrowFn(
      `/destine/ifs-nemo-seasonal-${group?.id}.parquet`
    )
  });

  const extents = destineArrowData
    ? getDataExtent(destineArrowData.table)
    : { temperature: null, salinity: null };

  const quarterData = group && seasonalData?.[group.id];

  useEffect(() => {
    if (!quarterData) return;
    setDestineYear(quarterData.temperature[0].year);
  }, [setDestineYear, quarterData]);

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

            {quarterData && (
              <Suspense fallback={<p />}>
                <Box>
                  <Divider
                    borderColor='base.100'
                    borderBottomWidth='2px'
                    my={6}
                  />
                  <ChartsSection data={quarterData} layerExtents={extents} />
                </Box>
              </Suspense>
            )}
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
