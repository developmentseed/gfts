import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { chakra, Box, usePrevious } from '@chakra-ui/react';
import {
  differenceInDays,
  isWithinInterval,
  lastDayOfMonth
} from 'date-fns';
import { extent } from 'd3';

import { SlidingBox } from '../chart-utils/sliding-box';
import { usePanZoomControlled } from '../chart-utils/use-pan-and-zoom-controlled';
import { useScaleX } from '../chart-utils/use-scales';
import { useDateRenders } from '../chart-utils/use-date-renders';
import { formatMonthYear, isSameDayUndef, pulseAnimation } from '../chart-utils/utils';
import { DAY_WIDTH, PADDING, useSizes } from './use-sizes';
import { AxisX } from './axis-x';

import { clamp } from '$utils/format';

interface ChartProps {
  selectedDay?: Date;
  data: Date[];
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

export function StringChart(props: ChartProps) {
  const { observe, dataArea, chart } = useSizes();

  // Ensure the chart only renders when we have the sizes to use.
  return (
    <Box ref={observe} position='relative' w='100%' h='4rem'>
      {dataArea.width > 0 && !!props.data.length && (
        <StringChartContent {...props} dataArea={dataArea} chart={chart} />
      )}
    </Box>
  );
}

function StringChartContent(
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

  const dateDomain = useMemo(() => extent(data) as [Date, Date], [data]);

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

  const { daysToRender, monthsToRender } = useDateRenders({
    scale: scalePartial
  });

  // Reposition the chart when a day is selected.
  // Only do so if the day is not already visible.
  const prevSelectedDay = usePrevious(selectedDay);
  useEffect(() => {
    if (!isSameDayUndef(prevSelectedDay, selectedDay)) {
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
          <clipPath id='data-width'>
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
        <g clipPath='url(#data-width)'>
          <AxisX
            selectedDay={selectedDay}
            onDaySelect={onDaySelect}
            data={data}
            ticks={daysToRender}
            xScale={scalePartial}
            dataArea={dataArea}
          />
        </g>
        <g clipPath='url(#data-width)'>
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

        <g clipPath='url(#data-width)'>
          <chakra.line
            x1={0}
            x2={dataArea.x2}
            y1={dataArea.y}
            y2={dataArea.y}
            stroke='base.200'
          />
          {daysToRender.map((day) => (
            <React.Fragment key={day.toISOString()}>
              {isSameDayUndef(hoveringDay, day) &&
                !isSameDayUndef(day, selectedDay) && (
                  <chakra.circle
                    cx={scalePartial(day)}
                    cy={dataArea.y}
                    r={3}
                    fill='none'
                    stroke='base.400'
                    strokeWidth={2}
                    animation={`${pulseAnimation} infinite`}
                  />
                )}

              {isSameDayUndef(day, selectedDay) && (
                <chakra.circle
                  cx={scalePartial(day)}
                  cy={dataArea.y}
                  r={7}
                  fill='base.400'
                />
              )}
              <chakra.circle
                cx={scalePartial(day)}
                cy={dataArea.y}
                r={5}
                fill='base.200'
                onMouseEnter={() => setHoveringDay(day)}
                onMouseLeave={() => setHoveringDay(undefined)}
                onClick={() => onDaySelect(day)}
                _hover={{
                  cursor: 'pointer'
                }}
              />
              <chakra.circle
                cx={scalePartial(day)}
                cy={dataArea.y}
                r={3}
                fill='base.400'
                pointerEvents='none'
              />
            </React.Fragment>
          ))}
        </g>
      </chakra.svg>
    </Box>
  );
}
