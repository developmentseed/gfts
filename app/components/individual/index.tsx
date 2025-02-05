import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  IconButton,
  Skeleton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs
} from '@chakra-ui/react';
import {
  CollecticonChevronLeftSmall,
  CollecticonChevronRightSmall,
  CollecticonCirclePlay,
  CollecticonCircleStop
} from '@devseed-ui/collecticons-chakra';
import { useQuery } from '@tanstack/react-query';

import { requestIndividualArrowFn } from './data';
import { useDaySelect } from './utils';

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
import { StringChart } from '$components/common/chart-string';

interface SpeciesComponentProps {
  params: {
    id: string;
  };
}

/**
 * Individual fish component.
 */
export default function Component(props: SpeciesComponentProps) {
  const {
    params: { id }
  } = props;

  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const { setCurrentPDFIndex } = useIndividualContext();

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
    data: rawArrowData,
    isFetching: isArrowFetching,
    error: arrowError
  } = useQuery({
    enabled: !!data,
    queryKey: ['individual', id, 'arrow'],
    queryFn: requestIndividualArrowFn(id)
  });

  const dataLength = rawArrowData?.dates.length || 0;

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

  const arrowDates = useMemo(() => {
    return rawArrowData?.dates.map((d) => new Date(d));
  }, [rawArrowData]);

  const [selectedDay, setSelectedDay] = useDaySelect(arrowDates);
  const [panZoomValue, setPanZoomValue] = useState({ x: 0, y: 0, zoom: 1 });

  if (error || arrowError) {
    return <RouteErrorHandler error={(error || arrowError)!} />;
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

      <Tabs size='sm' colorScheme='base' mx={-4}>
        <TabList>
          <Tab fontWeight='bold'>Visualize</Tab>
          <Tab fontWeight='bold'>Learn</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <LocationProbability />
            {arrowDates && (
              <StringChart
                selectedDay={selectedDay}
                data={arrowDates}
                onDaySelect={setSelectedDay}
                panZoomValue={panZoomValue}
                onPanZoomValueChange={setPanZoomValue}
              />
            )}
            <Flex gap={2}>
              <IconButton
                size='sm'
                variant='outline'
                aria-label='Previous'
                icon={<CollecticonChevronLeftSmall />}
                onClick={() => {
                  setCurrentPDFIndex((currentPDFIndex) => {
                    return changeValue(currentPDFIndex, dataLength - 1, -1);
                  });
                }}
              />
              <IconButton
                size='sm'
                variant='outline'
                aria-label='Next'
                icon={<CollecticonChevronRightSmall />}
                onClick={() => {
                  setCurrentPDFIndex((currentPDFIndex) => {
                    return changeValue(currentPDFIndex, dataLength - 1, 1);
                  });
                }}
              />
              <IconButton
                size='sm'
                variant='outline'
                aria-label={isAnimating ? 'Stop' : 'Play'}
                icon={
                  isAnimating ? (
                    <CollecticonCircleStop />
                  ) : (
                    <CollecticonCirclePlay />
                  )
                }
                onClick={() => setIsAnimating((isAnimating) => !isAnimating)}
              />
            </Flex>
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
