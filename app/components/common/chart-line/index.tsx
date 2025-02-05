import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { chakra, Box, usePrevious } from '@chakra-ui/react';
import {
  differenceInDays,
  isWithinInterval,
  lastDayOfMonth
} from 'date-fns';
import { extent } from 'd3';

import { SlidingBox } from '../chart-utils/sliding-box';
import { useDateRenders } from '../chart-utils/use-date-renders';
import { usePanZoomControlled } from '../chart-utils/use-pan-and-zoom-controlled';
import { useScaleX, useScaleY } from '../chart-utils/use-scales';
import { formatMonthYear, isSameDayUndef } from '../chart-utils/utils';
import { LineData } from './types';
import { PADDING, DAY_WIDTH } from './use-sizes';
import { useSizes } from './use-sizes';
import { DataLine } from './data-line';
import { AxisY } from './axis-y';
import { AxisX } from './axis-x';

import { clamp } from '$utils/format';

interface ChartProps {
  selectedDay?: Date;
  data: LineData[];
  onDaySelect: (day: Date) => void;
  panZoomValue: { x: number; y: number; zoom: number };
  onPanZoomValueChange: React.Dispatch<
    React.SetStateAction<{ x: number; y: number; zoom: number }>
  >;
  onPanZoomExtentChange?: (v: {
    minZoom: number;
    maxZoom: number;
    minY: number;
    maxY: number;
    minX: number;
    maxX: number;
  }) => void;
}

export function LineChart(props: ChartProps) {
  const { observe, dataArea, chart } = useSizes();

  // Ensure the chart only renders when we have the sizes to use.
  return (
    <Box ref={observe} position='relative' w='100%' minH='36'>
      {dataArea.width > 0 && !!props.data.length && (
        <LineChartContent {...props} dataArea={dataArea} chart={chart} />
      )}
    </Box>
  );
}

function LineChartContent(
  props: ChartProps & {
    dataArea: ReturnType<typeof useSizes>['dataArea'];
    chart: ReturnType<typeof useSizes>['chart'];
  }
) {
  const {
    selectedDay,
    data,
    onDaySelect,
    panZoomValue,
    onPanZoomValueChange,
    onPanZoomExtentChange,
    dataArea,
    chart
  } = props;

  const [hoveringDay, setHoveringDay] = useState<Date>();

  const { dateDomain, valueDomain } = useMemo(
    () => ({
      dateDomain: extent(data, (d) => d.date) as [Date, Date],
      valueDomain: extent(data, (d) => d.value) as [number, number]
    }),
    [data]
  );

  // Number of days in the date domain.
  const numDays = useMemo(
    () => differenceInDays(dateDomain[1], dateDomain[0]),
    [dateDomain]
  );

  const minPanX = -(
    numDays * DAY_WIDTH +
    DAY_WIDTH / 2 -
    dataArea.width -
    PADDING.left
  );
  const panZoomExtent = useMemo(
    () => ({
      minZoom: 1,
      maxZoom: 1,
      minY: 0,
      maxY: 0,
      minX: minPanX,
      maxX: 0
    }),
    [minPanX]
  );

  // Make the panZoom controlled.
  useEffect(() => {
    onPanZoomExtentChange?.(panZoomExtent);
  }, [panZoomExtent, onPanZoomExtentChange]);

  const { pan, setContainer, panZoomHandlers } = usePanZoomControlled({
    ...panZoomExtent,
    disableWheel: true,
    value: panZoomValue,
    onChange: useCallback(
      (event) => {
        if (event.userInitiated) {
          onPanZoomValueChange(event.value);
        }
      },
      [onPanZoomValueChange]
    )
  });

  const { scaleFull, scalePartial, createScalePartial } = useScaleX({
    dataArea,
    dateDomain,
    numDays,
    xTranslate: -pan.x,
    dayWidth: DAY_WIDTH
  });
  const { yScale, yTicks } = useScaleY({
    dataArea,
    yDomain: valueDomain
  });

  const { daysToRender, monthsToRender } = useDateRenders({
    scale: scalePartial
  });

  // Reposition the chart when a day is selected.
  // Only do so if the day is not already visible.
  const prevSelectedDay = usePrevious(selectedDay);
  useEffect(() => {
    if (
      !isSameDayUndef(prevSelectedDay, selectedDay)
    ) {
      const visibleDays = {
        start: daysToRender[0],
        // There's one extra day that's rendered but it is not visible to avoid
        // flickering issues.
        end: daysToRender[daysToRender.length - 2]
      };

      if (!isWithinInterval(selectedDay!, visibleDays)) {
        const centerAdjust = dataArea.width / 2;
        const newPanX = clamp(
          scaleFull(selectedDay!) - centerAdjust,
          0,
          -minPanX
        );

        onPanZoomValueChange((v) => ({ ...v, x: -newPanX }));
      }
    }
  }, [
    onPanZoomValueChange,
    prevSelectedDay,
    selectedDay,
    daysToRender,
    scaleFull,
    dataArea.width,
    createScalePartial,
    minPanX
  ]);

  return (
    <Box
      ref={(el) => {
        setContainer(el);
      }}
      style={{ touchAction: 'none' }}
      {...panZoomHandlers}
    >
      <chakra.svg
        width={chart.width}
        height={chart.height}
        display='block'
        fontFamily='body'
        userSelect='none'
      >
        <defs>
          <clipPath id='line-chart-data-width'>
            <rect
              x={dataArea.x - DAY_WIDTH / 2}
              y={0}
              width={dataArea.width + DAY_WIDTH / 2}
              height={chart.height}
            />
          </clipPath>
        </defs>

        {/* <rect
          x={dataArea.x}
          y={dataArea.y}
          width={dataArea.width}
          height={dataArea.height}
          fillOpacity={0.5}
          fill='red'
        /> */}

        <AxisY ticks={yTicks} yScale={yScale} dataArea={dataArea} />

        <g clipPath='url(#line-chart-data-width)'>
          <AxisX
            selectedDay={selectedDay}
            onDaySelect={onDaySelect}
            data={data}
            ticks={daysToRender}
            xScale={scalePartial}
            dataArea={dataArea}
            onHoveringDayChange={setHoveringDay}
            // hoveringDay={hoveringDay || bisectingDay?.date}
            hoveringDay={hoveringDay}
          />
        </g>

        <g clipPath='url(#line-chart-data-width)'>
          {monthsToRender.map((month) => (
            <SlidingBox
              key={month.toISOString()}
              minX={dataArea.x}
              startX={scalePartial(month) - DAY_WIDTH / 2}
              endX={scalePartial(lastDayOfMonth(month)) + DAY_WIDTH / 2}
            >
              <chakra.text
                dy='1.2em'
                x={0}
                y={dataArea.y2}
                fontSize={12}
                fill='base.400'
              >
                {formatMonthYear(month)}
              </chakra.text>
            </SlidingBox>
          ))}
        </g>

        <g clipPath='url(#line-chart-data-width)'>
          <DataLine xScale={scalePartial} yScale={yScale} data={data} />
        </g>
      </chakra.svg>
    </Box>
  );
}
