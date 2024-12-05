import React, { ElementType } from 'react';
import { Badge, Flex, Heading, Switch } from '@chakra-ui/react';

interface DataSectionHeadProps {
  title: string;
  unit?: string;
  onToggle?: () => void;
  checked?: boolean;
  hLevel?: ElementType;
}

export function DataSectionHead(props: DataSectionHeadProps) {
  const { title, unit, onToggle, checked, hLevel = 'h2' } = props;

  return (
    <Flex gap={4}>
      <Heading as={hLevel} size='xs'>
        {title}{' '}
        {unit && (
          <Badge
            bg='base.400a'
            color='surface.500'
            px='0.375rem'
            borderRadius='md'
            lineHeight='1.25'
          >
            {unit}
          </Badge>
        )}
      </Heading>
      {onToggle && (
        <Switch
          colorScheme='primary'
          ml='auto'
          onChange={onToggle}
          isChecked={checked}
        />
      )}
    </Flex>
  );
}
