import React from 'react';
import { Flex, FlexProps, Heading, Text } from '@chakra-ui/react';

interface PanelHeaderProps {
  suptitle?: React.ReactNode;
  subtitle?: React.ReactNode;
  heading: React.ReactNode;
}

export function PanelHeader(props: FlexProps & PanelHeaderProps) {
  const { suptitle, subtitle, heading, ...rest } = props;

  return (
    <Flex
      as='header'
      direction='column'
      gap={2}
      mx={-4}
      px={4}
      pb={4}
      w='100%'
      {...rest}
    >
      {suptitle && (
        <Text as='p' color='base.400'>
          {suptitle}
        </Text>
      )}
      <Flex gap={2}>
        <Heading size='md'>{heading}</Heading>
      </Flex>
      {subtitle && (
        <Text as='p' color='base.400' mt={-2}>
          {subtitle}
        </Text>
      )}
    </Flex>
  );
}
