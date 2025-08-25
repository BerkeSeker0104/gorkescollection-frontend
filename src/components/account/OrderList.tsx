'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getOrders } from '@/lib/api';
import type { Order } from '@/types';
import { Truck, ShoppingBag, Star } from 'lucide-react';
import clsx from 'clsx';

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
      case 'PaymentSucceeded': return { text: 'Ödeme Başarılı', color: 'bg-blue-100 text-blue-800' };
      case 'Shipped': return { text: 'Kargoya Verildi', color: 'bg-indigo-100 text-indigo-800' };
      case 'Delivered': return { text: 'Teslim Edildi', color: 'bg-green-100 text-green-800' };
      case 'PaymentFailed': return { text: 'Ödeme Başarısız', color: 'bg-red-100 text-red-800' };
      default: return { text: 'Hazırlanıyor', color: 'bg-yellow-100 text-yellow-800' };
    }
  };

  // GÜNCELLENDİ: Bu fonksiyon artık tanımsız/null değerlere karşı güvenli.
  const formatCurrency = (amount?: number | null) => {
    // Eğer 'amount' bir sayı değilse, varsayılan olarak 0'ı formatla.
    if (typeof amount !== 'number') {
      return (0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
    }
    return amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
  };

  if (loading) return <p>Siparişler yükleniyor...</p>;

  return (
    <div>
      {orders.length > 0 ? (
        <div className="space-y-8">
          {orders.map((order) => {
            const statusInfo = translateStatus(order.orderStatus);
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
                <div className="bg-zinc-50 p-4 sm:p-5 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-4">
                     <div>
                        <p className="font-bold text-lg text-zinc-800">Sipariş #{order.id}</p>
                        <p className="text-sm text-zinc-500">{new Date(order.orderDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={clsx('px-3 py-1 text-xs font-semibold rounded-full', statusInfo.color)}>
                        {statusInfo.text}
                    </span>
                    <p className="font-semibold text-lg text-zinc-900">{formatCurrency(order.total)}</p>
                  </div>
                </div>

                <div className="divide-y divide-zinc-200">
                  {order.orderItems.map((item) => (
                    <div key={item.productId} className="p-4 sm:p-5 flex items-start sm:items-center gap-4">
                      <Image
                        src={item.imageUrl || `https://placehold.co/100x100?text=${encodeURIComponent(item.productName)}`}
                        alt={item.productName}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg border border-zinc-200"
                      />
                      <div className="flex-grow">
                        <Link href={`/urun/${item.productId}`} className="font-semibold text-zinc-800 hover:text-[#A58E74] transition-colors">
                            {item.productName}
                        </Link>
                        <p className="text-sm text-zinc-500 mt-1">{item.quantity} x {formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 text-sm ml-auto">
                        <Link href={`/urun/${item.productId}`} className="flex items-center gap-1.5 text-zinc-600 hover:text-black transition-colors whitespace-nowrap">
                            <ShoppingBag size={14} /> Tekrar Satın Al
                        </Link>
                        {order.orderStatus === 'Delivered' && (
                           <Link href={`/urun/${item.productId}#reviews`} className="flex items-center gap-1.5 text-zinc-600 hover:text-black transition-colors whitespace-nowrap">
                              <Star size={14} /> Değerlendir
                           </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {order.trackingNumber && (
                   <div className="bg-zinc-50 p-4 sm:p-5 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <Truck size={18} className="text-zinc-400" />
                        <div>
                           <span className="font-medium">{order.cargoCompany}</span> • <span className="font-mono">{order.trackingNumber}</span>
                        </div>
                      </div>
                      <Link href={`/kargo-takip?no=${encodeURIComponent(order.trackingNumber)}`} className="inline-flex items-center justify-center rounded-md bg-[#2a2a2a] px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 transition-opacity whitespace-nowrap">
                        Kargoyu Takip Et
                      </Link>
                   </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-12 text-center">
            <p className="text-zinc-600">Henüz hiç sipariş vermediniz.</p>
        </div>
      )}
    </div>
  );
}