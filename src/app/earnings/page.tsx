export const dynamic = 'force-dynamic';

'use client';

import { Suspense } from 'react';
import EarningsContent from './earnings-content';

export default function EarningsPage() {
  return (
    <Suspense fallback={<div>Loading earnings...</div>}>
      <EarningsContent />
    </Suspense>
  );
}
