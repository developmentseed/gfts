import React, { useEffect, useMemo, useState } from 'react';
import { Flex } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';

import { requestIndividualArrowFn } from './data';

import { DataSectionHead } from '$components/common/data-section-head';
import { useIndividualContext } from '$components/common/app-context';
import { LineChart } from '$components/common/line-chart';

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

  const { currentPDFIndex } = useIndividualContext();

  const {
    data: rawArrowData,
    isFetching: isArrowFetching,
    error: arrowError
  } = useQuery({
    queryKey: ['individual', id, 'arrow'],
    queryFn: requestIndividualArrowFn(id)
  });

  const [selectedDay, setSelectedDay] = useState<Date>();
  const [panZoomValue, setPanZoomValue] = useState({ x: 0, y: 0, zoom: 1 });

  useEffect(() => {
    if (rawArrowData) {
      setSelectedDay(new Date(rawArrowData.dates[currentPDFIndex]!));
    }
  }, [rawArrowData, currentPDFIndex]);

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
          <DataSectionHead title='Temperature' unit='°C' />
          <LineChart
            selectedDay={selectedDay}
            data={temperature}
            onDaySelect={setSelectedDay}
            panZoomValue={panZoomValue}
            onPanZoomValueChange={setPanZoomValue}
          />
          <DataSectionHead title='Pressure' unit='...' />
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

type CombineData = <R, T extends unknown[][]>(
  matrix: [...T],
  cb: (...args: { [K in keyof T]: T[K] extends (infer U)[] ? U : never }) => R
) => R[];

const combineData: CombineData = (matrix, cb) => {
  return matrix[0].map((_, i) => {
    const values = matrix.map((row) => row[i]) as any;
    return cb(...values);
  });
};
