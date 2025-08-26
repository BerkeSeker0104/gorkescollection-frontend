'use client';

import { useCart } from "@/context/CartContext";
import { getSettings } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus } from "lucide-react";
import { useEffect, useState } from "react";
import { Setting } from "@/types";
import { useAuth } from "@/context/AuthContext";
import CouponInput from "@/components/CouponInput";

// YENİ: Para birimini formatlamak için yardımcı fonksiyon
const formatCurrency = (amount: number) => {
  return amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
};

export default function CartPage() {
  const { cart, addItem, decreaseItem, removeItem, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const checkoutEnabled = process.env.NEXT_PUBLIC_CHECKOUT_ENABLED === "true";

  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settings, setSettings] = useState<{ fee: number; threshold: number }>({
    fee: 50,
    threshold: 2000,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setSettingsLoading(true);
      try {
        const fetchedSettings = await getSettings();
        const fee = parseFloat(fetchedSettings.find((s: Setting) => s.key === "ShippingFee")?.value || "50");
        const threshold = parseFloat(fetchedSettings.find((s: Setting) => s.key === "FreeShippingThreshold")?.value || "2000");
        setSettings({ fee, threshold });
      } catch (error) {
        console.error("Ayarlar alınamadı:", error);
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const subtotal = cart?.subtotal || 0;
  const discountAmount = cart?.discountAmount || 0;
  const shippingFee = settingsLoading ? 0 : subtotal >= settings.threshold ? 0 : settings.fee;
  const total = cart?.total !== undefined ? cart.total + shippingFee : subtotal - discountAmount + shippingFee;

  if (cartLoading && !cart) {
    return (
      <div className="container mx-auto px-6 py-16 text-center pt-48">
        Yükleniyor...
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-6 py-16 text-center pt-48">
        <h1 className="text-3xl font-bold text-gray-800">Sepetiniz Boş</h1>
        <p className="text-gray-600 mt-4">
          Görünüşe göre sepetinize henüz bir şey eklemediniz.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block bg-gray-900 text-white font-bold py-3 px-8 rounded-md hover:bg-gray-700 transition-colors"
        >
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white pt-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-center">
          Alışveriş Sepetim
        </h1>

        <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <section aria-labelledby="cart-heading" className="lg:col-span-7">
            <ul role="list" className="divide-y divide-gray-200 border-b border-t border-gray-200">
              {cart.items.map((item) => (
                <li key={item.productId} className="relative flex py-6 sm:py-10">
                  <div className="flex-shrink-0">
                    <Image
                      src={item.imageUrl || `https://placehold.co/200x200/F7F5F2/333333.png?text=${encodeURIComponent(item.name)}`}
                      alt={item.name}
                      width={200}
                      height={200}
                      className="h-24 w-24 rounded-md object-cover object-center sm:h-48 sm:w-48"
                    />
                  </div>
                  <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                    <div>
                      <h3 className="text-sm">
                        <Link href={`/urun/${item.productId}`} className="font-medium text-gray-700 hover:text-gray-800">
                          {item.name}
                        </Link>
                      </h3>
                      {/* ======================= FİYAT GÖSTERİMİ GÜNCELLEMESİ ======================= */}
                      <div className="mt-1 text-sm font-medium text-gray-900">
                        {item.isOnSaleNow && item.priceOriginal && item.priceOriginal > item.price ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-gray-500 line-through">
                              {formatCurrency(item.priceOriginal)}
                            </span>
                            <span className="text-red-600">
                              {formatCurrency(item.price)}
                            </span>
                          </div>
                        ) : (
                          <span>{formatCurrency(item.price)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center mt-4">
                      <p className="text-sm text-gray-500 mr-4">Adet:</p>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button type="button" onClick={() => decreaseItem(item.productId)} disabled={cartLoading} className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50">
                          <Minus size={16} />
                        </button>
                        <span className="px-4 py-1 text-gray-800 font-medium">{item.quantity}</span>
                        <button type="button" onClick={() => addItem(item.productId)} disabled={cartLoading} className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50">
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="absolute right-0 top-6">
                    <button type="button" onClick={() => removeItem(item.productId)} className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500" disabled={cartLoading}>
                      <span className="sr-only">Kaldır</span>
                      <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="summary-heading"
            className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
          >
            <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
              Sipariş Özeti
            </h2>

            {/* ======================= ÖZET GÜNCELLEMESİ ======================= */}
            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">Ara Toplam</dt>
                <dd className="text-sm font-medium text-gray-900">{formatCurrency(subtotal)}</dd>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-green-600">
                  <dt className="text-sm flex items-center">
                    <span>İndirim ({cart.appliedCouponCode})</span>
                  </dt>
                  <dd className="text-sm font-medium">-{formatCurrency(discountAmount)}</dd>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="flex items-center text-sm text-gray-600">
                  <span>Kargo Ücreti</span>
                </dt>
                <dd className="text-sm font-medium text-gray-900">
                  {settingsLoading ? "Hesaplanıyor..." : shippingFee === 0 ? "Ücretsiz" : formatCurrency(shippingFee)}
                </dd>
              </div>

              {!settingsLoading && subtotal > 0 && subtotal < settings.threshold && (
                <div className="text-center text-xs text-green-600 pt-2">
                  Ücretsiz kargo için sepetinize <strong>{formatCurrency(settings.threshold - subtotal)}</strong> daha ekleyin!
                </div>
              )}

              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="text-base font-medium text-gray-900">Toplam</dt>
                <dd className="text-base font-medium text-gray-900">
                  {settingsLoading ? "Hesaplanıyor..." : formatCurrency(total)}
                </dd>
              </div>
            </dl>
            
            <CouponInput />

            <div className="mt-6">
              {/* ... Ödeme Butonu Aynı ... */}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}