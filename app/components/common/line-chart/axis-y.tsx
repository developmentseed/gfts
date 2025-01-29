import React from 'react';
import { chakra } from '@chakra-ui/react';

import { DAY_WIDTH, PADDING } from './utils';

interface AxisYProps {
  ticks: number[];
  yScale: (value: number) => number;
  dataArea: { x: number; x2: number; y: number; y2: number };
}

export function AxisY(props: AxisYProps) {
  const { ticks, yScale, dataArea } = props;

  return (
    <g>
      {ticks.map((tick) => (
        <g key={tick}>
          <chakra.line
            x1={dataArea.x - DAY_WIDTH / 2}
            y1={yScale(tick)}
            x2={dataArea.x2}
            y2={yScale(tick)}
            stroke='base.100a'
          />
          <chakra.text
            dy='0.3em'
            x={PADDING.left - DAY_WIDTH / 2 - 4}
            y={yScale(tick)}
            fontSize={12}
            fill='base.400'
            textAnchor='end'
          >
            {tick}
          </chakra.text>
        </g>
      ))}
    </g>
  );
}
