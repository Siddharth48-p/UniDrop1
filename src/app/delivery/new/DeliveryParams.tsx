'use client';

import { useSearchParams } from 'next/navigation';

export default function DeliveryParams() {
  const params = useSearchParams();
  const id = params.get('id');

  return <div>Delivery ID: {id ?? 'No ID found in URL'}</div>;
}
