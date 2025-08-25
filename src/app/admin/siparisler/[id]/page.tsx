'use client';

import { useEffect, useState } from "react";
import { Order, ShipOrderDto } from "@/types";
import { getOrderById, shipOrder, markOrderAsProcessing, markOrderAsDelivered, cancelOrder } from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Play, XCircle, Truck } from 'lucide-react';
import clsx from "clsx";

const shippingSchema = z.object({
  cargoCompany: z.string().min(2, "Kargo firması adı gereklidir."),
  trackingNumber: z.string().min(5, "Geçerli bir takip numarası girin."),
});

const inputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm";
const buttonStyle = "w-full flex items-center justify-center gap-2 text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50";

export default function AdminOrderDetailPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const orderId = id ? parseInt(id, 10) : NaN;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShipOrderDto>({
    resolver: zodResolver(shippingSchema),
  });

  const fetchOrder = async () => {
    if (Number.isNaN(orderId)) return;
    const fetchedOrder = await getOrderById(orderId);
    setOrder(fetchedOrder);
  };

  useEffect(() => {
    if (!id || Number.isNaN(orderId)) return;
    setLoading(true);
    fetchOrder().finally(() => setLoading(false));
  }, [id, orderId]);

  const handleStatusUpdate = async (action: 'process' | 'deliver' | 'cancel') => {
    if (Number.isNaN(orderId)) return;

    if (action === 'cancel') {
      if (!window.confirm('Bu siparişi iptal etmek istediğinizden emin misiniz? İptal edilen ürünler stoğa geri eklenecektir.')) {
        return;
      }
    }

    setIsUpdating(true);
    try {
      let success = false;
      if (action === 'process') success = await markOrderAsProcessing(orderId);
      else if (action === 'deliver') success = await markOrderAsDelivered(orderId);
      else if (action === 'cancel') success = await cancelOrder(orderId);
      
      if (success) {
        await fetchOrder();
        alert('Sipariş durumu başarıyla güncellendi.');
      }
    } catch (error: any) {
      alert(`Hata: ${error.message || 'İşlem başarısız oldu.'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShipOrder = async (data: ShipOrderDto) => {
    if (Number.isNaN(orderId)) return;
    const success = await shipOrder(orderId, data);
    if (success) {
      await fetchOrder();
      alert("Sipariş kargolandı olarak işaretlendi.");
    } else {
      alert("Sipariş güncellenirken bir hata oluştu.");
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PaymentSucceeded': return { text: 'Ödeme Başarılı', color: 'text-blue-600' };
      case 'Processing': return { text: 'Hazırlanıyor', color: 'text-orange-600' };
      case 'Shipped': return { text: 'Kargoya Verildi', color: 'text-indigo-600' };
      case 'Delivered': return { text: 'Teslim Edildi', color: 'text-green-600' };
      case 'Cancelled': return { text: 'İptal Edildi', color: 'text-red-600' };
      case 'PaymentFailed': return { text: 'Ödeme Başarısız', color: 'text-red-600' };
      default: return { text: 'Beklemede', color: 'text-gray-600' };
    }
  };

  if (!id || Number.isNaN(orderId)) return <p>Geçersiz sipariş numarası.</p>;
  if (loading) return <p>Sipariş detayları yükleniyor...</p>;
  if (!order) return <p>Sipariş bulunamadı.</p>;

  const requestedCarrier: string | undefined = (order as any)?.requestedCarrier;
  const statusInfo = getStatusInfo(order.orderStatus);

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Sipariş Detayları: #{order.id}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol: Ürünler ve Adres */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Sipariş Edilen Ürünler</h3>
            <ul className="divide-y divide-gray-200">
              {order.orderItems.map((item) => (
                <li key={item.productId} className="py-3 flex justify-between">
                  <span>
                    {item.productName} x {item.quantity}
                  </span>
                  <span>{(item.price * item.quantity).toFixed(2)} TL</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t text-right font-bold">
              Toplam: {(order.subtotal + order.shippingFee).toFixed(2)} TL
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Teslimat Adresi</h3>
            <p className="font-medium">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.address1}</p>
            <p>{order.shippingAddress.district}, {order.shippingAddress.city} {order.shippingAddress.postalCode}</p>
            <p className="text-sm text-gray-600 mt-2">Telefon: {order.shippingAddress.phoneNumber || "-"}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Müşterinin Seçtiği Kargo</h3>
            <p className="text-sm text-gray-700">{requestedCarrier || "— (bilgi yok)"}</p>
          </div>
        </div>

        {/* Sağ: Durum ve Aksiyonlar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Sipariş Durumu ve Aksiyonlar</h3>
            <div className="mb-4">
              <span className="text-sm text-gray-600">Mevcut Durum: </span>
              <span className={clsx("font-bold", statusInfo.color)}>{statusInfo.text}</span>
            </div>
            <div className="space-y-3">
              {order.orderStatus === 'PaymentSucceeded' && (
                <>
                  <button onClick={() => handleStatusUpdate('process')} disabled={isUpdating} className={clsx(buttonStyle, "bg-blue-600 hover:bg-blue-700")}>
                    <Play size={16} /> <span>Hazırlanıyor Olarak İşaretle</span>
                  </button>
                  <button onClick={() => handleStatusUpdate('cancel')} disabled={isUpdating} className={clsx(buttonStyle, "bg-red-600 hover:bg-red-700")}>
                    <XCircle size={16} /> <span>Siparişi İptal Et</span>
                  </button>
                </>
              )}
              {order.orderStatus === 'Processing' && (
                <form onSubmit={handleSubmit(handleShipOrder)} className="space-y-4 border-t pt-4 mt-4">
                  <div>
                    <label htmlFor="cargoCompany" className="text-sm font-medium">Kargo Firması</label>
                    <input type="text" {...register("cargoCompany")} className={inputStyle} placeholder={requestedCarrier || "Aras / PTT / Hepsijet / Sürat"} />
                    {errors.cargoCompany && <p className="text-xs text-red-500">{errors.cargoCompany.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="trackingNumber" className="text-sm font-medium">Kargo Takip Numarası</label>
                    <input type="text" {...register("trackingNumber")} className={inputStyle} />
                    {errors.trackingNumber && <p className="text-xs text-red-500">{errors.trackingNumber.message}</p>}
                  </div>
                  <button type="submit" disabled={isSubmitting} className={clsx(buttonStyle, "bg-indigo-600 hover:bg-indigo-700")}>
                    {isSubmitting ? "Kaydediliyor..." : "Kargoya Verildi Olarak İşaretle"}
                  </button>
                </form>
              )}
              {order.orderStatus === 'Shipped' && (
                 <button onClick={() => handleStatusUpdate('deliver')} disabled={isUpdating} className={clsx(buttonStyle, "bg-green-600 hover:bg-green-700")}>
                    <CheckCircle size={16} /> <span>Teslim Edildi Olarak İşaretle</span>
                 </button>
              )}
              {(order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled' || order.orderStatus === 'PaymentFailed') && (
                <p className="text-sm text-gray-500 text-center py-4">Bu sipariş için başka bir işlem yapılamaz.</p>
              )}
            </div>
            {order.trackingNumber && (
              <div className="border-t mt-6 pt-4 space-y-2">
                <div className="text-sm flex items-center gap-2">
                  <Truck size={16} className="text-gray-500" />
                  <span className="text-gray-600">Kargo: </span>
                  <span className="font-medium">{order.cargoCompany} - {order.trackingNumber}</span>
                </div>
                <Link href={`/kargo-takip?no=${encodeURIComponent(order.trackingNumber)}`} target="_blank" className="text-sm text-blue-600 hover:underline">
                  Kargo Takibini Görüntüle
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}