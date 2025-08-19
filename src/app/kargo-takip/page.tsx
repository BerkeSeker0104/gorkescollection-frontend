import { Suspense } from 'react';
import TrackingClient from './TrackingClient';

// Bu route dinamik çalışsın (no-store kullandığın için)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="bg-gray-50 min-h-screen pt-36 pb-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="bg-white p-6 rounded-lg shadow-sm">Yükleniyor…</div>
          </div>
        </div>
      }
    >
      <TrackingClient />
    </Suspense>
  );
}