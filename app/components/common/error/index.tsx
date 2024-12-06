import React from 'react';
import { Box } from '@chakra-ui/react';

import { PanelHeader } from '../panel-header';
import { NotFound } from './not-found';

interface RouteErrorHandlerProps {
  error: Error;
}

export function RouteErrorHandler(props: RouteErrorHandlerProps) {
  const { error } = props;

  if (error instanceof NotFound) {
    return (
      <Box w='100%'>
        <PanelHeader suptitle='Error' heading='Not found' />
        <Box>
          We&apos;re sorry, but the fish you&apos;re trying to find doesn&apos;t
          exist, or it was eaten.
        </Box>
      </Box>
    );
  }

  return (
    <Box w='100%'>
      <PanelHeader
        suptitle='Error'
        heading='An error occurred'
      />
      <Box>
        {error.message || 'Not details available'}
      </Box>
    </Box>
  );
}
