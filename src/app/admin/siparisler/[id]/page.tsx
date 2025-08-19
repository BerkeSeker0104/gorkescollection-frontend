'use client';

import { useEffect, useState } from "react";
import { Order, ShipOrderDto } from "@/types";
import { getOrderById, shipOrder } from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useParams, useRouter } from "next/navigation";

const shippingSchema = z.object({
  cargoCompany: z.string().min(2, "Kargo firması adı gereklidir."),
  trackingNumber: z.string().min(5, "Geçerli bir takip numarası girin."),
});

const inputStyle =
  "mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-sm";

export default function AdminOrderDetailPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!id || Number.isNaN(orderId)) return;

    const run = async () => {
      setLoading(true);
      const fetchedOrder = await getOrderById(orderId);
      setOrder(fetchedOrder);
      setLoading(false);
    };

    run();
  }, [id, orderId]);

  const handleShipOrder = async (data: ShipOrderDto) => {
    if (Number.isNaN(orderId)) return;

    const success = await shipOrder(orderId, data);
    if (success) {
      router.push("/admin/siparisler");
      router.refresh();
    } else {
      alert("Sipariş güncellenirken bir hata oluştu.");
    }
  };

  if (!id || Number.isNaN(orderId)) return <p>Geçersiz sipariş numarası.</p>;
  if (loading) return <p>Sipariş detayları yükleniyor...</p>;
  if (!order) return <p>Sipariş bulunamadı.</p>;

  // Backend'de eklediğimiz alanı types güvenli okumak için:
  const requestedCarrier: string | undefined = (order as any)?.requestedCarrier;

  const trackingUrl = order.trackingNumber
    ? `/kargo-takip?no=${encodeURIComponent(order.trackingNumber)}`
    : null;

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Sipariş Detayları: #{order.id}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol: Ürünler ve Adres */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
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

          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h3 className="font-semibold text-lg mb-4">Teslimat Adresi</h3>
            <p className="font-medium">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.address1}</p>
            <p>
              {order.shippingAddress.district}, {order.shippingAddress.city}{" "}
              {order.shippingAddress.postalCode}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Telefon: {order.shippingAddress.phoneNumber || "-"}
            </p>
          </div>

          {/* Müşterinin seçtiği kargo */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Müşterinin Seçtiği Kargo</h3>
            <p className="text-sm text-gray-700">
              {requestedCarrier || "— (bilgi yok)"}
            </p>
          </div>
        </div>

        {/* Sağ: Kargolama ve Takip */}
        <div className="space-y-6">
          {/* Takip kartı */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Kargo Takibi</h3>
            {order.orderStatus === "Shipped" && order.trackingNumber ? (
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-600">Kargo Firması: </span>
                  <span className="font-medium">{order.cargoCompany || "-"}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Takip No: </span>
                  <span className="font-medium">{order.trackingNumber}</span>
                </div>
                {trackingUrl && (
                  <a
                    href={trackingUrl}
                    target="_blank"
                    className="inline-flex items-center justify-center rounded-md bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800"
                  >
                    Kargo Takibini Aç
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Bu sipariş henüz kargoya verilmemiş.
              </p>
            )}
          </div>

          {/* Manuel kargolama formu */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Siparişi Kargola</h3>

            {order.orderStatus === "Shipped" ? (
              <div>
                <p className="font-medium text-green-600">
                  Bu sipariş kargolandı.
                </p>
                <p className="text-sm mt-2">Firma: {order.cargoCompany}</p>
                <p className="text-sm">Takip No: {order.trackingNumber}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(handleShipOrder)} className="space-y-4">
                <div>
                  <label htmlFor="cargoCompany" className="text-sm font-medium">
                    Kargo Firması
                  </label>
                  <input
                    type="text"
                    {...register("cargoCompany")}
                    className={inputStyle}
                    placeholder={requestedCarrier || "Aras / PTT / Hepsijet / Sürat"}
                  />
                  {errors.cargoCompany && (
                    <p className="text-xs text-red-500">
                      {errors.cargoCompany.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="trackingNumber" className="text-sm font-medium">
                    Kargo Takip Numarası
                  </label>
                  <input
                    type="text"
                    {...register("trackingNumber")}
                    className={inputStyle}
                  />
                  {errors.trackingNumber && (
                    <p className="text-xs text-red-500">
                      {errors.trackingNumber.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gray-800 text-white py-2 rounded-md"
                >
                  {isSubmitting ? "Kaydediliyor..." : "Kargoya Verildi Olarak İşaretle"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}