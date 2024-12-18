import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router } from 'wouter';

import theme from '$styles/theme';

import PageLayout from '$components/common/page-layout';

const publicUrl = process.env.PUBLIC_URL || '';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity
    }
  }
});

// Root component.
function Root() {
  useEffect(() => {
    // Hide the welcome banner.
    const banner = document.querySelector('#welcome-banner');
    if (!banner) return;
    setTimeout(() => {
      banner.classList.add('dismissed');
      setTimeout(() => banner.remove(), 500);
    }, 500);
  }, []);

  return (
    <ChakraProvider theme={theme} resetCSS>
      <QueryClientProvider client={queryClient}>
        <Router
          base={
            new URL(
              publicUrl.startsWith('http')
                ? publicUrl
                : `https://ds.io/${publicUrl.replace(/^\//, '')}`
            ).pathname
          }
        >
          <PageLayout />
        </Router>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

const rootNode = document.querySelector('#app-container')!;
const root = createRoot(rootNode);
root.render(<Root />);
