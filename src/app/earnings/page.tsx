'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import EarningsContent from './earnings-content';

export default function EarningsPage() {
  return (
    <Suspense fallback={<div>Loading earnings...</div>}>
      <EarningsContent />
    </Suspense>
  );
}
