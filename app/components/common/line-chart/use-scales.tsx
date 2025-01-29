import { useCallback, useMemo } from 'react';
import { scaleLinear, scaleTime } from 'd3';

import { DAY_WIDTH } from './utils';

export function useScales(params: {
  dataArea: { x: number; x2: number; y: number; y2: number };
  yDomain: [number, number];
  dateDomain: [Date, Date];
  numDays: number;
  xTranslate: number;
}) {
  const {
    dataArea,
    yDomain: [min, max],
    dateDomain,
    numDays,
    xTranslate
  } = params;

  // Scale for the full size of the timeline taking the size of each day into
  // account.
  const scaleFull = useMemo(
    () =>
      scaleTime()
        .domain(dateDomain)
        .range([dataArea.x, numDays * DAY_WIDTH]),
    [dateDomain, numDays, dataArea]
  );

  // Scale creator for the visible part of the timeline taking the given pan.
  const createScalePartial = useCallback(
    (xTranslate) => {
      const firstDay = scaleFull.invert(xTranslate + dataArea.x);
      const lastDay = scaleFull.invert(xTranslate + dataArea.x2);

      return scaleTime()
        .domain([firstDay, lastDay])
        .range([dataArea.x, dataArea.x2]);
    },
    [dataArea, scaleFull]
  );

  const scalePartial = useMemo(
    () => createScalePartial(xTranslate),
    [createScalePartial, xTranslate]
  );

  const { yScale, yTicks } = useMemo(() => {
    const yScale = scaleLinear()
      .domain([min, max])
      .range([dataArea.y2, dataArea.y]);
    const yTicks = yScale.ticks(4);

    return { yScale, yTicks };
  }, [dataArea, min, max]);

  return { scaleFull, scalePartial, createScalePartial, yScale, yTicks };
}
