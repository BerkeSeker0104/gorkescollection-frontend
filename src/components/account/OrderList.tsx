'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrders } from '@/lib/api';
import type { Order } from '@/types';

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const fetched = await getOrders();
      setOrders(fetched.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
      setLoading(false);
    };
    run();
  }, []);

  const translateStatus = (status: string) => {
    switch (status) {
      case 'PaymentSucceeded': return 'Ödeme Başarılı';
      case 'Shipped': return 'Kargoya Verildi';
      case 'Delivered': return 'Teslim Edildi';
      default: return 'Hazırlanıyor';
    }
  };

  if (loading) return <p>Siparişler yükleniyor...</p>;

  return (
    <div>
      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <p className="font-bold text-zinc-800">Sipariş #{order.id}</p>
                  <p className="text-sm text-zinc-500">Tarih: {new Date(order.orderDate).toLocaleDateString('tr-TR')}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {translateStatus(order.orderStatus)}
                </span>
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4">
                {order.orderItems.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-4 py-2">
                    <p className="flex-grow font-medium text-zinc-700">{item.productName}</p>
                    <p className="text-sm text-zinc-500">{item.quantity} x {item.price.toFixed(2)} TL</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4 text-right">
                <p className="font-semibold text-zinc-900">Toplam: {(order.subtotal + order.shippingFee).toFixed(2)} TL</p>
              </div>

              <div className="mt-3">
                {order.trackingNumber ? (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="text-sm text-zinc-600 text-left">
                      Kargo: <span className="font-medium">{order.cargoCompany || '-'}</span> • Takip No: <span className="font-mono">{order.trackingNumber}</span>
                    </div>
                    <Link href={`/kargo-takip?no=${encodeURIComponent(order.trackingNumber)}`} className="inline-flex items-center justify-center rounded-md bg-[#2a2a2a] px-3 py-1.5 text-sm font-medium text-white hover:bg-opacity-90">
                      Kargoyu Takip Et
                    </Link>
                  </div>
                ) : (
                  <div className="text-sm text-zinc-500">Kargo bilgisi henüz eklenmedi.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-zinc-500 text-center py-10">Henüz hiç sipariş vermediniz.</p>
      )}
    </div>
  );
}
