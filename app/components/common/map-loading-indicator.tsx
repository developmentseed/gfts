import React from 'react';
import { Fade, Flex, Text } from '@chakra-ui/react';
import { CollecticonMap } from '@devseed-ui/collecticons-chakra';

interface MapLoadingIndicatorProps {
  isLoading: boolean;
}

export function MapLoadingIndicator(props: MapLoadingIndicatorProps) {
  const { isLoading } = props;

  return (
    <Fade in={isLoading}>
      <Flex
        pointerEvents='none'
        alignItems='center'
        justifyContent='center'
        direction='column'
        position='absolute'
        gap={2}
        p={8}
        w='10rem'
        h='10rem'
        top='50%'
        left='50%'
        transform='translate(0, -50%)'
        zIndex={1000}
      >
        <CollecticonMap size='4rem' color='primary.600a' />
        <Text textTransform='uppercase'>Loading...</Text>
      </Flex>
    </Fade>
  );
}
