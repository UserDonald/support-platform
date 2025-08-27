'use client';

import { ConvexProvider, ConvexReactClient } from 'convex/react';
import * as React from 'react';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || '');

export function Providers({ children }: { children: React.ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
