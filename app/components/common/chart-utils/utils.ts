import { keyframes } from '@emotion/react';
import { timeFormat } from 'd3';
import { isSameDay } from 'date-fns';

export const pulseKeyframes = keyframes`
  from { opacity: 1; r: 3px }
  to   { opacity: 0; r: 10px }
`;

export const pulseAnimation = `${pulseKeyframes} 1s ease-in-out`;

export const formatMonthYear = timeFormat('%b %Y');

export function isSameDayUndef(
  a: string | number | Date | undefined | null,
  b: string | number | Date | undefined | null
)  {
  return a && b && isSameDay(a, b);
}
