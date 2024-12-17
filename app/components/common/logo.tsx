import React from 'react';
import { chakra, ChakraProps, useToken } from '@chakra-ui/react';

export default function Logo(props: ChakraProps) {
  const [colorPrimary] = useToken('colors', ['primary.500']);

  return (
    <chakra.svg
      width='128px'
      height='80px'
      viewBox='0 0 128 80'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        d='M37.9908 61.6875C37.9908 82.122 21.4295 98.6875 1 98.6875C1 78.253 17.5614 61.6875 37.9908 61.6875Z'
        fill={colorPrimary}
      />
      <path
        d='M37.9908 66.3125C37.9908 45.878 21.4295 29.3125 1 29.3125C1 49.747 17.5614 66.3125 37.9908 66.3125Z'
        fill={colorPrimary}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M90.0092 101C110.439 101 127 84.4345 127 64C127 43.5655 110.439 27 90.0092 27C59.3761 27 34.5229 64 34.5229 64C34.5229 64 59.3761 101 90.0092 101ZM93.3506 82.5C103.565 82.5 111.846 74.2173 111.846 64C111.846 53.7827 103.565 45.5 93.3506 45.5C83.1359 45.5 74.8552 53.7827 74.8552 64C74.8552 74.2173 83.1359 82.5 93.3506 82.5Z'
        fill={colorPrimary}
      />
    </chakra.svg>
  );
}
