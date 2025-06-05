import React from 'react';
import { Box, Flex, Text, useToken, VisuallyHidden } from '@chakra-ui/react';
import { round } from '$utils/format';

interface LegendBarProps {
  stops: { value: number; color: string }[];
  unit?: string;
  labels?: string[] | number[];
  disabled?: boolean;
}

export function LegendBar(props: LegendBarProps) {
  const { stops, unit, labels, disabled } = props;

  const lastStop = stops[stops.length - 1];

  const shadowColor = useToken('colors', 'base.100a');

  return (
    <Box
      transition='filter 160ms ease-in-out, opacity 160ms ease-in-out'
      css={
        disabled
          ? {
              filter: 'grayscale(1)',
              opacity: '0.64'
            }
          : {}
      }
    >
      <Box
        aria-hidden
        height={2}
        width='100%'
        bg={`linear-gradient(to right, ${stops.map((stop) => stop.color).join(', ')})`}
        borderRadius='full'
        boxShadow={`inset 0 0 0 1px ${shadowColor}`}
      />
      <Flex justifyContent='space-between' fontSize='xs'>
        {labels ? (
          labels.map((label, i) => (
            <Text key={`label-${[i]}`} as='span'>
              {label}
            </Text>
          ))
        ) : (
          <>
            <VisuallyHidden>From</VisuallyHidden>
            <Text as='span'>{round(stops[0].value, 3)}</Text>
            <VisuallyHidden>to</VisuallyHidden>
            <Text as='span'>{round(lastStop.value, 3)}</Text>
            {unit !== undefined && <VisuallyHidden>{unit}</VisuallyHidden>}
          </>
        )}
      </Flex>
    </Box>
  );
}
