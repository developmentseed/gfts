import React from 'react';
import { chakra, ChakraProps, useToken } from '@chakra-ui/react';

export default function Logo(props: ChakraProps) {
  const [colorPrimary] = useToken('colors', ['primary.500']);

  return (
    <chakra.svg
      width='128'
      height='80'
      viewBox='0 0 128 80'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        d='M37.9908 37.6875C37.9908 58.122 21.4295 74.6875 1 74.6875C1 54.253 17.5614 37.6875 37.9908 37.6875Z'
        fill={colorPrimary}
      />
      <path
        d='M37.9908 42.3125C37.9908 21.878 21.4295 5.3125 1 5.3125C1 25.747 17.5614 42.3125 37.9908 42.3125Z'
        fill={colorPrimary}
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M90.0092 77C110.439 77 127 60.4345 127 40C127 19.5655 110.439 3 90.0092 3C59.3761 3 34.5229 40 34.5229 40C34.5229 40 59.3761 77 90.0092 77ZM93.3506 58.5C103.565 58.5 111.846 50.2173 111.846 40C111.846 29.7827 103.565 21.5 93.3506 21.5C83.1359 21.5 74.8552 29.7827 74.8552 40C74.8552 50.2173 83.1359 58.5 93.3506 58.5Z'
        fill={colorPrimary}
      />
    </chakra.svg>
  );
}
