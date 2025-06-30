'use client';

import { Suspense } from 'react';
import DashboardContent from './dashboard-content';

export const dynamic = 'force-dynamic'; // ✅ Required to disable static generation for /dashboard

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
