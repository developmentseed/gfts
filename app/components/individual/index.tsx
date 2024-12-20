import React, { useState } from 'react';
import {
  Box,
  Button,
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

import { requestIndividualParquetFn } from './data';

import SmartLink from '$components/common/smart-link';
import { PanelHeader } from '$components/common/panel-header';
import { getJsonFn, IndividualListed } from '$utils/api';
import { LegendBar } from '$components/common/legend-bar';
import { DataSectionHead } from '$components/common/data-section-head';
import { RouteErrorHandler } from '$components/common/error';
import { NotFound } from '$components/common/error/not-found';
import { useIndividualContext } from '$components/common/app-context';
import { changeValue } from '$utils/format';
import { useRafEffect } from '$utils/use-raf-effect-hook';

interface SpeciesComponentProps {
  params: {
    id: string;
  };
}

/**
 * Individual dish component.
 */
export default function Component(props: SpeciesComponentProps) {
  const {
    params: { id }
  } = props;

  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const { currentPDFIndex, setCurrentPDFIndex } = useIndividualContext();

  const { data, isSuccess, error } = useQuery<
    IndividualListed[],
    Error,
    IndividualListed
  >({
    queryKey: ['individuals'],
    queryFn: getJsonFn(`/api/individual/index.json`),
    select(data) {
      const individual = data.find((d) => d.id === id);
      if (!individual) {
        throw new NotFound('Individual not found', {
          id
        });
      }
      return individual;
    }
  });

  const {
    data: rawParquetData,
    isFetching: isParquetFetching,
    error: parquetError
  } = useQuery({
    enabled: !!data,
    queryKey: ['individual', id, 'parquet'],
    queryFn: requestIndividualParquetFn(id)
  });

  const dataLength = Object.keys(rawParquetData || {}).length;

  useRafEffect(
    () => {
      setCurrentPDFIndex((currentPDFIndex) => {
        return changeValue(currentPDFIndex, dataLength - 1, 1);
      });
    },
    30,
    isAnimating,
    [dataLength, setCurrentPDFIndex]
  );

  if (error || parquetError) {
    return <RouteErrorHandler error={(error || parquetError)!} />;
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
              <CollecticonChevronLeftSmall /> {data?.id}
            </SmartLink>
          ) : (
            <Skeleton height={8} width='8rem' />
          )
        }
        subtitle={
          isSuccess ? (
            data?.species
          ) : (
            <Skeleton height={4} width='15rem' mt={1} as='span' />
          )
        }
      />

      <Button
        disabled={isParquetFetching}
        onClick={() => setIsAnimating((isAnimating) => !isAnimating)}
        onWheel={(e) => {
          setCurrentPDFIndex((currentPDFIndex) => {
            return changeValue(
              currentPDFIndex,
              dataLength - 1,
              e.deltaY < 0 ? -1 : 1
            );
          });
        }}
      >
        {isAnimating ? 'Stop' : 'Play'} ({currentPDFIndex})
      </Button>

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

function LocationProbability() {
  return (
    <Flex direction='column' gap={4}>
      <DataSectionHead
        title='Location Probability'
        unit='%'
        // onToggle={console.log}
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
