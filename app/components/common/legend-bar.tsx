import React from 'react';
import { Box, Flex, Text, useToken, VisuallyHidden } from '@chakra-ui/react';
import { round } from '$utils/format';

interface LegendBarProps {
  stops: { value: number; color: string }[];
  unit?: string;
}

export function LegendBar(props: LegendBarProps) {
  const { stops, unit } = props;

  const lastStop = stops[stops.length - 1];

  const shadowColor = useToken('colors', 'base.100a');

  return (
    <Box>
      <Box
        aria-hidden
        height={2}
        width='100%'
        bg={`linear-gradient(to right, ${stops.map((stop) => stop.color).join(', ')})`}
        borderRadius='full'
        boxShadow={`inset 0 0 0 1px ${shadowColor}`}
      />
      <Flex justifyContent='space-between' fontSize='xs'>
        <VisuallyHidden>From</VisuallyHidden>
        <Text as='span'>{round(stops[0].value, 3)}</Text>
        <VisuallyHidden>to</VisuallyHidden>
        <Text as='span'>{round(lastStop.value, 3)}</Text>
        {unit !== undefined && <VisuallyHidden>{unit}</VisuallyHidden>}
      </Flex>
    </Box>
  );
}
