// src/components/admin/SubscriberList.tsx

'use client';

import { useEffect, useState } from 'react';
import { StockNotificationSubscriber } from '@/types';
import { getStockNotificationSubscribers } from '@/lib/api';

export default function SubscriberList({ productId }: { productId: number }) {
  const [subscribers, setSubscribers] = useState<StockNotificationSubscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscribers = async () => {
      setLoading(true);
      const data = await getStockNotificationSubscribers(productId);
      setSubscribers(data);
      setLoading(false);
    };

    fetchSubscribers();
  }, [productId]);

  if (loading) {
    return <p className="text-sm text-gray-500">Aboneler yükleniyor...</p>;
  }

  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="text-lg font-medium text-gray-900">Stoğa Gelince Haber Ver İstekleri</h3>
      {subscribers.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {subscribers.map((sub, index) => (
            <li key={index} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-md">
              <span className="text-gray-700">{sub.userEmail}</span>
              <span className="text-gray-500">
                {new Date(sub.requestDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-gray-500">Bu ürün için bildirim bekleyen kimse yok.</p>
      )}
    </div>
  );
}