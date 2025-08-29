'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { Provider as JotaiProvider } from 'jotai';
import * as React from 'react';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || '');

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      <JotaiProvider>{children}</JotaiProvider>
    </ConvexProvider>
  );
}
