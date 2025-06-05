import React, { useState } from 'react';
import { Flex } from '@chakra-ui/react';
import { interpolateInferno } from 'd3';

import { CsvChartQuarterData } from './data';

import { DataSectionHead } from '$components/common/data-section-head';
import { LineAvgChart } from '$components/common/chart-line-avg';
import { useSpeciesContext } from '$components/common/app-context';
import { LegendBar } from '$components/common/legend-bar';
import { getColorLegend } from '$utils/data/color';

export default function Charts(props: {
  data: CsvChartQuarterData;
  layerExtents: {
    temperature: [number, number] | null;
    salinity: [number, number] | null;
  };
}) {
  const { data, layerExtents } = props;

  const { setDestineLayer, destineLayer, destineYear, setDestineYear } =
    useSpeciesContext();

  const [hoverYear, setHoverYear] = useState<number>();

  return (
    <Flex direction='column' gap={4} w='100%'>
      <DataSectionHead
        title='Ocean Surface Temperature'
        unit='K'
        hLevel='h3'
        onToggle={(checked) => setDestineLayer(!checked ? 'temperature' : null)}
        checked={destineLayer === 'temperature'}
      />
      {layerExtents.temperature && (
        <LegendBar
          disabled={destineLayer !== 'temperature'}
          stops={getColorLegend(interpolateInferno)}
          labels={layerExtents.temperature.map((l) => l.toFixed(2))}
        />
      )}
      <LineAvgChart
        data={data.temperature}
        onHover={(year) => setHoverYear(year)}
        onSelect={(year) => setDestineYear(year)}
        hoverYear={hoverYear}
        selectedYear={destineYear}
      />
      <DataSectionHead
        title='Ocean Surface Salinity'
        unit='ppt'
        hLevel='h3'
        onToggle={(checked) => setDestineLayer(!checked ? 'salinity' : null)}
        checked={destineLayer === 'salinity'}
      />
      {layerExtents.salinity && (
        <LegendBar
          disabled={destineLayer !== 'salinity'}
          stops={getColorLegend(interpolateInferno)}
          labels={layerExtents.salinity.map((l) => l.toFixed(2))}
        />
      )}
      <LineAvgChart
        data={data.salinity}
        onHover={(year) => setHoverYear(year)}
        onSelect={(year) => setDestineYear(year)}
        hoverYear={hoverYear}
        selectedYear={destineYear}
      />
    </Flex>
  );
}
