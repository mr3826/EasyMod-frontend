
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ssrRouter } from './app/ssr-routes';

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: 2,
        gcTime: 1000 * 60 * 30,
      },
    },
  });
  return renderToString(
    <QueryClientProvider client={queryClient}>
      <StaticRouter location={url}>
        {ssrRouter}
      </StaticRouter>
    </QueryClientProvider>
  );
}
