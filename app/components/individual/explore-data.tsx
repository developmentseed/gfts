import React, { useMemo, useState } from 'react';
import { Flex, Heading } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';

import { requestIndividualArrowFn } from './data';
import { combineData, useDaySelect } from './utils';

import { DataSectionHead } from '$components/common/data-section-head';
import { LineChart } from '$components/common/chart-line';

interface SpeciesComponentProps {
  params: {
    id: string;
  };
}

/**
 * Individual fish explore component.
 */
export default function Component(props: SpeciesComponentProps) {
  const {
    params: { id }
  } = props;

  const {
    data: rawArrowData,
    isFetching: isArrowFetching,
    error: arrowError
  } = useQuery({
    queryKey: ['individual', id, 'arrow'],
    queryFn: requestIndividualArrowFn(id)
  });

  const arrowDates = useMemo(() => {
    return rawArrowData?.dates.map((d) => new Date(d));
  }, [rawArrowData]);

  const [selectedDay, setSelectedDay] = useDaySelect(arrowDates);
  const [panZoomValue, setPanZoomValue] = useState({ x: 0, y: 0, zoom: 1 });

  const { temperature, pressure } = useMemo(() => {
    if (!rawArrowData) {
      return {
        temperature: [],
        pressure: []
      };
    }
    const mostProb = rawArrowData.mostProbableTable;

    const dates = mostProb
      .getChild('date')!
      .toJSON()
      .map((d) => new Date(d!));
    const temperature = mostProb.getChild('temperature')!.toJSON();
    const pressure = mostProb.getChild('pressure')!.toJSON();

    return {
      temperature: combineData([dates, temperature], (date, value) => ({
        date,
        value: value!
      })),
      pressure: combineData([dates, pressure], (date, value) => ({
        date,
        value: value!
      }))
    };
  }, [rawArrowData]);

  if (arrowError) {
    return null;
  }

  return (
    <Flex
      position='absolute'
      width='25rem'
      top={4}
      bottom={4}
      right={!isArrowFetching ? 4 : '-30rem'}
      zIndex={100}
      p={4}
      pl={2}
      gap={2}
      bg='surface.400a'
      borderRadius='md'
      backdropFilter='blur(1rem)'
      transition='right 320ms ease-in'
    >
      <Flex bg='surface.500' borderRadius='md' w='100%' p={4}>
        <Flex direction='column' gap={4} w='100%'>
          <Heading
            as='h2'
            size='sm'
            mx={-4}
            px={4}
            pb={4}
            borderBottom='2px'
            borderBottomColor='base.100'
          >
            Measurements
          </Heading>

          <DataSectionHead title='Temperature' unit='°C' hLevel='h3' />
          <LineChart
            selectedDay={selectedDay}
            data={temperature}
            onDaySelect={setSelectedDay}
            panZoomValue={panZoomValue}
            onPanZoomValueChange={setPanZoomValue}
          />
          <DataSectionHead title='Pressure' unit='PSI?' hLevel='h3' />
          <LineChart
            selectedDay={selectedDay}
            data={pressure}
            onDaySelect={setSelectedDay}
            panZoomValue={panZoomValue}
            onPanZoomValueChange={setPanZoomValue}
          />
        </Flex>
      </Flex>
    </Flex>
  );
}
