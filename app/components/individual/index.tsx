import React, { Suspense, useMemo, useState } from 'react';
import {
  Box,
  Divider,
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
import { getPDFColorLegend } from '$utils/data/color';
import { MdContent } from '$components/common/md-content';

const ChartsSection = React.lazy(() => import('./charts'));

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
    <Flex w='100%' direction='column'>
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
      <Tabs
        size='sm'
        colorScheme='base'
        mx={-4}
        isLazy
        display='flex'
        flexDirection='column'
        minHeight={0}
      >
        <TabList>
          <Tab fontWeight='bold'>Visualize</Tab>
          <Tab fontWeight='bold'>Learn</Tab>
        </TabList>

        <TabPanels overflowY='scroll'>
          <TabPanel>
            {isArrowFetching && (
              <Flex direction='column' gap={2}>
                <Skeleton height={8} width='100%' />
                <Skeleton height={8} width='100%' />
                <Skeleton height={8} width='100%' />
                <Flex gap={4}>
                  <Skeleton boxSize={8} />
                  <Skeleton boxSize={8} />
                  <Skeleton boxSize={8} />
                </Flex>
              </Flex>
            )}
            {rawArrowData && arrowDates && (
              <Flex direction='column' gap={4}>
                <Box>
                  <LocationProbability />
                  <StringChart
                    selectedDay={selectedDay}
                    data={arrowDates}
                    onDaySelect={setSelectedDay}
                    panZoomValue={panZoomValue}
                    onPanZoomValueChange={setPanZoomValue}
                  />
                </Box>
                <Flex gap={2}>
                  <IconButton
                    size='sm'
                    variant='outline'
                    aria-label='Previous'
                    icon={<CollecticonChevronLeftSmall />}
                    onClick={() => {
                      setCurrentPDFIndex((currentPDFIndex) =>
                        changeValue(currentPDFIndex, dataLength - 1, -1)
                      );
                    }}
                  />
                  <IconButton
                    size='sm'
                    variant='outline'
                    aria-label='Next'
                    icon={<CollecticonChevronRightSmall />}
                    onClick={() => {
                      setCurrentPDFIndex((currentPDFIndex) =>
                        changeValue(currentPDFIndex, dataLength - 1, 1)
                      );
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
                    onClick={() => {
                      setIsAnimating((isAnimating) => !isAnimating);
                    }}
                  />
                </Flex>

                <Divider borderColor='base.100' borderBottomWidth='2px' />

                <Suspense fallback={<p />}>
                  <ChartsSection
                    arrowData={rawArrowData}
                    selectedDay={selectedDay}
                    onDaySelect={setSelectedDay}
                  />
                </Suspense>
              </Flex>
            )}
          </TabPanel>
          <TabPanel>
            <MdContent url={`/data/${id}/${id}.md`} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
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
      <LegendBar stops={getPDFColorLegend()} labels={['Less', 'More']} />
    </Flex>
  );
}
