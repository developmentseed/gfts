import React from 'react';
import { chakra } from '@chakra-ui/react';
import { isSameDay } from 'date-fns';

import { zeroPad } from '$utils/format';

interface AxisXProps {
  selectedDay?: Date;
  onDaySelect: (day: Date) => void;
  data: Date[];
  ticks: Date[];
  xScale: (date: Date) => number;
  dataArea: { y2: number };
}

export function AxisX(props: AxisXProps) {
  const { data, ticks, xScale, dataArea } = props;

  return ticks.map((day) => {
    const hasData = data.some((date) => isSameDay(date, day));
    const dayX = xScale(day);

    return (
      <chakra.text
        key={day.toISOString()}
        x={dayX}
        y={dataArea.y2 - 2}
        fontSize={12}
        fill={hasData ? 'base.400' : 'base.300'}
        fontWeight={hasData ? '600' : '400'}
        textAnchor='middle'
      >
        {zeroPad(day.getDate())}
      </chakra.text>
    );
  });
}
