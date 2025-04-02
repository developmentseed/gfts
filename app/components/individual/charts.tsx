import React, { useMemo, useState } from 'react';
import { Flex } from '@chakra-ui/react';

import { requestIndividualArrowFn } from './data';
import { combineData } from './utils';

import { DataSectionHead } from '$components/common/data-section-head';
import { LineChart } from '$components/common/chart-line';

interface SpeciesComponentProps {
  arrowData: Awaited<ReturnType<ReturnType<typeof requestIndividualArrowFn>>>;
  selectedDay: Date;
  onDaySelect: (date: Date) => void;
}

export default function Charts(props: SpeciesComponentProps) {
  const { arrowData, selectedDay, onDaySelect } = props;

  const [panZoomValue, setPanZoomValue] = useState({ x: 0, y: 0, zoom: 1 });

  const { temperature, pressure } = useMemo(() => {
    if (!arrowData) {
      return {
        temperature: [],
        pressure: []
      };
    }
    const mostProb = arrowData.mostProbableTable;

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
  }, [arrowData]);

  return (
    <Flex direction='column' gap={4} w='100%'>
      <DataSectionHead title='Temperature' unit='°C' hLevel='h3' />
      <LineChart
        selectedDay={selectedDay}
        data={temperature}
        onDaySelect={onDaySelect}
        panZoomValue={panZoomValue}
        onPanZoomValueChange={setPanZoomValue}
      />
      <DataSectionHead title='Pressure' unit='PSI' hLevel='h3' />
      <LineChart
        selectedDay={selectedDay}
        data={pressure}
        onDaySelect={onDaySelect}
        panZoomValue={panZoomValue}
        onPanZoomValueChange={setPanZoomValue}
      />
    </Flex>
  );
}
