import { useCallback, useMemo } from 'react';
import { scaleLinear, scaleTime } from 'd3';

export function useScaleX(params: {
  dataArea: { x: number; x2: number; y: number; y2: number };
  dateDomain: [Date, Date];
  numDays: number;
  xTranslate: number;
  dayWidth: number;
}) {
  const { dataArea, dateDomain, numDays, xTranslate, dayWidth } = params;

  // Scale for the full size of the timeline taking the size of each day into
  // account.
  const scaleFull = useMemo(
    () =>
      scaleTime()
        .domain(dateDomain)
        .range([dataArea.x, numDays * dayWidth]),
    [dateDomain, numDays, dataArea, dayWidth]
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

  return { scaleFull, scalePartial, createScalePartial };
}

export function useScaleY(params: {
  dataArea: { x: number; x2: number; y: number; y2: number };
  yDomain: [number, number];
}) {
  const {
    dataArea,
    yDomain: [min, max]
  } = params;

  const { yScale, yTicks } = useMemo(() => {
    const yScale = scaleLinear()
      .domain([min, max])
      .range([dataArea.y2, dataArea.y]);
    const yTicks = yScale.ticks(4);

    return { yScale, yTicks };
  }, [dataArea, min, max]);

  return { yScale, yTicks };
}
