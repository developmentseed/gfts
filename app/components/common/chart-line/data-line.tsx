import React, { useMemo } from 'react';
import { chakra } from '@chakra-ui/react';
import { line } from 'd3';

import { LineData } from './types';

interface DataLineProps {
  xScale: (date: Date) => number;
  yScale: (value: number) => number;
  data: LineData[];
}

export function DataLine(props: DataLineProps) {
  const { xScale, yScale, data } = props;

  const lineFn = useMemo(
    () =>
      line<LineData>()
        .x((d) => xScale(d.date))
        .y((d) => yScale(d.value)),
    [xScale, yScale]
  );

  return (
    <chakra.path
      d={lineFn(data)!}
      fill='none'
      stroke='primary.500'
      strokeWidth='2px'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  );
}
