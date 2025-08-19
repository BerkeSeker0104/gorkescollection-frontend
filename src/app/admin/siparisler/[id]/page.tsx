'use client';

import { useEffect, useState } from "react";
import { Order, ShipOrderDto } from "@/types";
import { getOrderById, shipOrder } from "@/lib/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useParams, useRouter } from "next/navigation";
import { createShipment } from "@/lib/api";

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
  const { id } = useParams<{ id: string }>(); // <-- params yerine useParams
  const orderId = id ? parseInt(id, 10) : NaN; // güvenli parse

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ShipOrderDto>({
    resolver: zodResolver(shippingSchema),
  });

  // --- Navlungo (Yeni) ---
  const [desi, setDesi] = useState<number | "">("");
  const [carrierId, setCarrierId] = useState<number | "">(9);
  const [postType, setPostType] = useState<number | "">(1);
  const [note, setNote] = useState<string>("");
  const [isCreatingShipment, setIsCreatingShipment] = useState(false);
  const [createdInfo, setCreatedInfo] = useState<{
    postNumber?: string;
    trackingUrl?: string;
    barcodeUrl?: string;
  } | null>(null);
  // ------------------------

  useEffect(() => {
    // id henüz gelmemişse veya geçersizse istek atma
    if (!id || Number.isNaN(orderId)) return;

    const fetchOrder = async () => {
      setLoading(true);
      const fetchedOrder = await getOrderById(orderId);
      setOrder(fetchedOrder);
      setLoading(false);
    };

    fetchOrder();
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

  // --- Navlungo (Yeni) ---
  const handleCreateShipment = async () => {
    if (Number.isNaN(orderId)) return;
    setIsCreatingShipment(true);
    setCreatedInfo(null);

    const payload: any = {};
    if (desi !== "") payload.desi = Number(desi);
    if (carrierId !== "") payload.carrierId = Number(carrierId);
    if (postType !== "") payload.postType = Number(postType);
    if (note.trim()) payload.note = note.trim();

    const res = await createShipment(orderId, payload);
    setIsCreatingShipment(false);

    if (!res) {
      alert("Navlungo gönderi oluşturma başarısız.");
      return;
    }
    setCreatedInfo(res);
    // Sipariş detayını tazelemek istersen:
    // const updated = await getOrderById(orderId);
    // setOrder(updated);
  };
  // ------------------------

  if (!id || Number.isNaN(orderId)) return <p>Geçersiz sipariş numarası.</p>;
  if (loading) return <p>Sipariş detayları yükleniyor...</p>;
  if (!order) return <p>Sipariş bulunamadı.</p>;

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

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Teslimat Adresi</h3>
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.address1}</p>
            <p>
              {order.shippingAddress.district}, {order.shippingAddress.city}{" "}
              {order.shippingAddress.postalCode}
            </p>
          </div>
        </div>

        {/* Sağ: Kargolama */}
        <div className="space-y-6">
          {/* Mevcut: Manuel kargolama formu */}
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
                  <label htmlFor="cargoCompany">Kargo Firması</label>
                  <input
                    type="text"
                    {...register("cargoCompany")}
                    className={inputStyle}
                  />
                  {errors.cargoCompany && (
                    <p className="text-xs text-red-500">
                      {errors.cargoCompany.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="trackingNumber">Kargo Takip Numarası</label>
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

          {/* Yeni: Navlungo ile Gönderi Oluştur */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-4">
              Navlungo ile Gönderi Oluştur (Test)
            </h3>

            {order.orderStatus === "Shipped" && order.trackingNumber ? (
              <div className="space-y-2">
                <p className="text-green-600 font-medium">
                  Bu sipariş zaten kargolanmış.
                </p>
                {createdInfo?.trackingUrl && (
                  <a
                    href={createdInfo.trackingUrl}
                    target="_blank"
                    className="underline text-sm"
                  >
                    Takip Linki
                  </a>
                )}
                {createdInfo?.barcodeUrl && (
                  <a
                    href={createdInfo.barcodeUrl}
                    target="_blank"
                    className="underline text-sm"
                  >
                    Barkod / Etiket
                  </a>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Desi</label>
                    <input
                      type="number"
                      step="0.1"
                      value={desi}
                      onChange={(e) =>
                        setDesi(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="Örn: 1.2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">CarrierId</label>
                    <input
                      type="number"
                      value={carrierId}
                      onChange={(e) =>
                        setCarrierId(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="Örn: 9"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">PostType</label>
                    <input
                      type="number"
                      value={postType}
                      onChange={(e) =>
                        setPostType(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="Örn: 1"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm mb-1">Not</label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                      placeholder="Opsiyonel not"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCreateShipment}
                  disabled={isCreatingShipment}
                  className="w-full bg-indigo-600 text-white mt-4 py-2 rounded-md"
                >
                  {isCreatingShipment ? "Oluşturuluyor..." : "Navlungo ile Gönderi Oluştur"}
                </button>

                {createdInfo && (
                  <div className="mt-4 text-sm space-y-1">
                    {createdInfo.postNumber && (
                      <p>
                        <b>Post No:</b> {createdInfo.postNumber}
                      </p>
                    )}
                    {createdInfo.trackingUrl && (
                      <p>
                        <b>Takip:</b>{" "}
                        <a
                          className="underline"
                          href={createdInfo.trackingUrl}
                          target="_blank"
                        >
                          Link
                        </a>
                      </p>
                    )}
                    {createdInfo.barcodeUrl && (
                      <p>
                        <b>Barkod:</b>{" "}
                        <a
                          className="underline"
                          href={createdInfo.barcodeUrl}
                          target="_blank"
                        >
                          PDF
                        </a>
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}