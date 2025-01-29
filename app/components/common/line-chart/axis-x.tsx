import React from 'react';
import { chakra, HTMLChakraProps } from '@chakra-ui/react';
import { isSameDay } from 'date-fns';

import { DAY_HEIGHT, DAY_WIDTH } from './utils';
import { zeroPad } from '$utils/format';

interface AxisXProps {
  selectedDay?: Date;
  onDaySelect: (day: Date) => void;
  data: { date: Date }[];
  ticks: Date[];
  xScale: (date: Date) => number;
  dataArea: { y2: number };
  onHoveringDayChange: (day?: Date) => void;
  hoveringDay?: Date;
}

export function AxisX(props: AxisXProps) {
  const {
    selectedDay,
    onDaySelect,
    data,
    ticks,
    xScale,
    dataArea,
    onHoveringDayChange,
    hoveringDay
  } = props;

  return ticks.map((day) => {
    const isSelected = selectedDay && isSameDay(selectedDay, day);
    const hasData = data.some(({ date }) => isSameDay(date, day));
    const dayX = xScale(day);
    const isHovering = hoveringDay && isSameDay(hoveringDay, day);

    const hoveringProps: HTMLChakraProps<'g'> = hasData
      ? {
          onMouseEnter: () => onHoveringDayChange(day),
          onMouseLeave: () => onHoveringDayChange(undefined),
          onClick: () => onDaySelect(day),
          cursor: 'pointer'
        }
      : {};

    if (isSelected) {
      return (
        <g key={day.toISOString()}>
          <chakra.line
            x1={dayX}
            y1={DAY_HEIGHT}
            x2={dayX}
            y2={dataArea.y2}
            stroke='primary.100a'
          />
          <chakra.rect
            x={dayX - DAY_WIDTH / 2}
            y={0}
            width={`${DAY_WIDTH}px`}
            height={`${DAY_HEIGHT}px`}
            fill='primary.100a'
            rx={4}
          />
          <chakra.text
            dy='0.5em'
            x={dayX}
            y={DAY_HEIGHT / 2}
            fontSize={12}
            fill='primary.500'
            fontWeight='600'
            textAnchor='middle'
          >
            {zeroPad(day.getDate())}
          </chakra.text>
        </g>
      );
    }

    return (
      <chakra.g key={day.toISOString()} {...hoveringProps}>
        <chakra.rect
          x={dayX - DAY_WIDTH / 2}
          y={0}
          rx={4}
          width={`${DAY_WIDTH}px`}
          height={`${DAY_HEIGHT}px`}
          fill={isHovering ? 'base.100a' : 'transparent'}
          transition='fill 0.32s'
        />
        <chakra.text
          dy='0.5em'
          x={dayX}
          y={DAY_HEIGHT / 2}
          fontSize={12}
          fill={hasData ? 'base.400' : 'base.300'}
          fontWeight={hasData ? '600' : '400'}
          textAnchor='middle'
        >
          {zeroPad(day.getDate())}
        </chakra.text>
      </chakra.g>
    );
  });
}
