import React from 'react';
import { chakra, Box } from '@chakra-ui/react';
import { extent, scaleLinear, line, area, bisector } from 'd3';

import { PADDING } from './use-sizes';
import { useSizes } from './use-sizes';
import { CsvChartDataVariable } from '$components/species/data';

interface ChartProps {
  data: CsvChartDataVariable[];
  onHover?: (year: number | undefined) => void;
  onSelect?: (year: number | undefined) => void;
  hoverYear?: number | undefined;
  selectedYear?: number | undefined;
}

export function LineAvgChart(props: ChartProps) {
  const { observe, dataArea, chart } = useSizes();

  // Ensure the chart only renders when we have the sizes to use.
  return (
    <Box ref={observe} position='relative' w='100%' minH='36'>
      {dataArea.width > 0 && !!props.data.length && (
        <LineAvgChartContent {...props} dataArea={dataArea} chart={chart} />
      )}
    </Box>
  );
}

function LineAvgChartContent(
  props: ChartProps & {
    dataArea: ReturnType<typeof useSizes>['dataArea'];
    chart: ReturnType<typeof useSizes>['chart'];
  }
) {
  const { data, dataArea, chart, hoverYear, selectedYear } = props;

  const bisectYear = bisector<CsvChartDataVariable, number>((d) => d.year).left;

  const findClosestYear = (mouseX: number): number | null => {
    if (mouseX < dataArea.x || mouseX > dataArea.x2) return null;

    const yearValue = xScale.invert(mouseX);
    const index = bisectYear(data, yearValue);
    const d0 = data[index - 1]?.year;
    const d1 = data[index]?.year;

    if (d0 && d1) {
      return yearValue - d0 > d1 - yearValue ? d1 : d0;
    }
    return d0 || d1 || null;
  };

  const handleMouseMove = (e: React.MouseEvent<SVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const year = findClosestYear(mouseX);
    props.onHover?.(year ?? undefined);
  };

  const handleMouseLeave = () => {
    props.onHover?.(undefined);
  };

  const handleClick = (e: React.MouseEvent<SVGElement>) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const year = findClosestYear(mouseX);
    if (year) {
      props.onSelect?.(year);
    }
  };

  const stdVals = data.flatMap((d) => [d.min, d.max]);

  const yScale = scaleLinear()
    .domain(extent(stdVals) as [number, number])
    .range([dataArea.y + 8, dataArea.y2])
    .nice();

  const xScale = scaleLinear()
    .domain(extent(data, (d) => d.year) as [number, number])
    .range([dataArea.x, dataArea.x2]);

  const lineGenerator = line<CsvChartDataVariable>()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.value));

  const areaGenerator = area<CsvChartDataVariable>()
    .x((d) => xScale(d.year))
    .y0((d) => yScale(d.min))
    .y1((d) => yScale(d.max));

  const yTicks = yScale.ticks(6);
  return (
    <Box minH='12rem'>
      <chakra.svg
        width={chart.width}
        height={chart.height}
        display='block'
        fontFamily='body'
        userSelect='none'
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <g>
          {yTicks.map((tick) => (
            <g key={tick}>
              <chakra.line
                x1={dataArea.x}
                y1={yScale(tick)}
                x2={dataArea.x2}
                y2={yScale(tick)}
                stroke='base.100a'
              />
              <chakra.text
                dy='0.3em'
                x={PADDING.left - 4}
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
        <g>
          {xScale.ticks().map((tick) => (
            <g key={tick}>
              <chakra.line
                y1={dataArea.y2}
                x1={xScale(tick)}
                y2={dataArea.y2 + 6}
                x2={xScale(tick)}
                stroke='base.200'
              />
              <chakra.text
                x={xScale(tick)}
                y={dataArea.y2 + 16}
                fontSize={12}
                fill='base.400'
                textAnchor='end'
                transform='rotate(-60deg)'
                css={{
                  transformBox: 'fill-box',
                  transformOrigin: 'right center'
                }}
              >
                {tick}
              </chakra.text>
            </g>
          ))}
        </g>

        {/* Add the area */}
        <chakra.path d={areaGenerator(data)!} fill='primary.200a' />

        {/* Add the line */}
        <chakra.path
          d={lineGenerator(data)!}
          stroke='primary.500'
          strokeWidth={2}
          fill='none'
          strokeLinejoin='round'
        />

        {/* Hover line */}
        {hoverYear && (
          <chakra.line
            x1={xScale(hoverYear)}
            y1={dataArea.y}
            x2={xScale(hoverYear)}
            y2={dataArea.y2}
            stroke='base.300'
            strokeWidth={1}
            strokeDasharray='4,4'
          />
        )}

        {/* Selected line */}
        {selectedYear && (
          <chakra.line
            x1={xScale(selectedYear)}
            y1={dataArea.y}
            x2={xScale(selectedYear)}
            y2={dataArea.y2}
            stroke='base.300'
            strokeWidth={2}
          />
        )}
      </chakra.svg>
    </Box>
  );
}
