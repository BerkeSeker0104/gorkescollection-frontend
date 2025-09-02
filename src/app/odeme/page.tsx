'use client';

import { useCart } from "@/context/CartContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ShippingAddress, Address } from "@/types";
import { initiatePaytrPayment, getAddresses, getSettings } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import toast from "react-hot-toast";
// 🔸 login kontrolü için
import { useAuth } from "@/context/AuthContext";
import Script from "next/script";

// 🔸 yeni: kargo seçimi bileşeni
import CarrierSelect, { CarrierKey } from "@/components/checkout/CarrierSelect";

const addressSchema = z.object({
  fullName: z.string().min(3, "Ad Soyad en az 3 karakter olmalıdır."),
  phoneNumber: z.string()
    .min(10, "Telefon numarası 10 haneli olmalıdır.")
    .max(10, "Telefon numarası 10 haneli olmalıdır.")
    .regex(/^[0-9]+$/, "Sadece rakam giriniz."),
  address1: z.string().min(10, "Adres en az 10 karakter olmalıdır."),
  address2: z.string().optional(),
  city: z.string().min(2, "Şehir adı en az 2 karakter olmalıdır."),
  district: z.string().min(2, "İlçe adı en az 2 karakter olmalıdır."),
  postalCode: z.string().min(5, "Posta kodu 5 karakter olmalıdır.").max(5, "Posta kodu 5 karakter olmalıdır."),
  country: z.string().min(2, "Ülke adı en az 2 karakter olmalıdır."),
});

const inputStyle =
  "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 p-3";

export default function CheckoutPage() {
  const { cart } = useCart();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // 🔸 login kontrolü
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settings, setSettings] = useState<{ fee: number; threshold: number }>({ fee: 50, threshold: 2000 });

  // 🔸 Misafir için email state
  const [guestEmail, setGuestEmail] = useState("");

  // PayTR iFrame token
  const [iframeToken, setIframeToken] = useState<string | null>(null);

  // 🔸 yeni: kargo seçimi state
  const [preferredCarrier, setPreferredCarrier] = useState<CarrierKey | null>(null);
  const [carrierTouched, setCarrierTouched] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ShippingAddress>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "Türkiye" }
  });

  useEffect(() => {
    const fetchData = async () => {
      setSettingsLoading(true);
      const [addresses, fetchedSettings] = await Promise.all([getAddresses(), getSettings()]);
      setSavedAddresses(addresses);
      const fee = parseFloat(fetchedSettings.find(s => s.key === 'ShippingFee')?.value || '50');
      const threshold = parseFloat(fetchedSettings.find(s => s.key === 'FreeShippingThreshold')?.value || '2000');
      setSettings({ fee, threshold });
      setSettingsLoading(false);
    };
    fetchData();
  }, []);

  const handleSelectAddress = (address: Address) => {
    reset({
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      address1: address.address1,
      address2: address.address2 || "",
      city: address.city,
      district: address.district,
      postalCode: address.postalCode,
      country: address.country || "Türkiye",
    });
    setSelectedAddressId(address.id);
  };

  // Ödeme başlat
  const onSubmit = async (data: ShippingAddress) => {
    try {
      // 🔸 Misafir ise email zorunlu
      const isGuest = !user;
      if (isGuest && !guestEmail) {
        toast.error("Misafir ödeme için e-posta zorunludur.");
        return;
      }

      // 🔸 Kargo seçimi zorunlu
      if (!preferredCarrier) {
        setCarrierTouched(true);
        toast.error("Lütfen bir kargo firması seçiniz.");
        return;
      }

      const token = await initiatePaytrPayment(
        data,
        isGuest ? guestEmail : undefined,
        preferredCarrier, // << kargo tercihini backend'e gönder
        cart?.appliedCouponCode || undefined
      );
      if (token) setIframeToken(token);
    } catch (error: any) {
      toast.error(error?.message || "Ödeme başlatılırken bir hata oluştu.");
    }
  };

  // Sepet indirimi ve ara toplamı cart’tan al; yoksa fallback hesapla
// ----------------- Tutar Hesabı (backend ile birebir) -----------------
const round2 = (n: number) => Math.round(n * 100) / 100;

const rawSubtotal =
  cart?.subtotal ??
  cart?.items.reduce((sum, i) => sum + i.price * i.quantity, 0) ??
  0;

const subtotal = round2(rawSubtotal);
const discountAmount = round2(cart?.discountAmount ?? 0);

const fee = Number.isFinite(settings.fee) ? settings.fee : 0;
const threshold = Number.isFinite(settings.threshold) ? settings.threshold : Number.MAX_SAFE_INTEGER;

const shippingFee =
  settingsLoading
    ? 0
    : (subtotal - discountAmount) >= threshold
      ? 0
      : fee;

const total = round2(subtotal - discountAmount + shippingFee);

// YENİ EKLENEN DETAYLI DEBUG LOG'LARI
console.log("--- HESAPLAMA DETAYLARI ---");
console.log("Cart Subtotal (Ara Toplam):", subtotal);
console.log("Discount (İndirim):", discountAmount);
console.log("Settings State (Ayarlar):", settings);
console.log("Settings Loading (Ayarlar Yükleniyor mu?):", settingsLoading);
console.log("Calculated Shipping Fee (Hesaplanan Kargo):", shippingFee);
console.log("FINAL TOTAL (NİHAİ TOPLAM):", total);
console.log("----------------------------");
  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-6 py-16 text-center pt-48">
        <h1 className="text-3xl font-bold text-gray-800">Önce Sepetinize Ürün Ekleyin</h1>
      </div>
    );
  }

  if (iframeToken) {
  return (
    <div className="bg-gray-50 pt-40">
      <Script src="https://www.paytr.com/js/iframeResizer.min.js" strategy="afterInteractive" />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold text-center mb-8">Güvenli Ödeme Ekranı</h1>

        {/* Daha geniş ve yeterli yükseklik */}
        <div className="mx-auto bg-white p-4 rounded-lg shadow-lg"
             style={{ maxWidth: 900, minHeight: 980 }}>
          <iframe
            id="paytriframe"
            src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
            frameBorder={0}
            scrolling="no"
            style={{ width: "100%", height: "900px", display: "block" }}
            allow="payment *"
          />
        </div>
      </div>

      <Script id="paytr-iframe-init" strategy="afterInteractive">
        {`
          (function init() {
            if (window.iFrameResize) {
              window.iFrameResize({}, '#paytriframe');
            } else {
              var t = setInterval(function(){
                if (window.iFrameResize) {
                  clearInterval(t);
                  window.iFrameResize({}, '#paytriframe');
                }
              }, 300);
              setTimeout(function(){ clearInterval(t); }, 5000);
            }
          })();
        `}
      </Script>
    </div>
  );
}

  return (
    <div className="bg-gray-50 pt-40">
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12 px-4 py-16">
        <div>
          {savedAddresses.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Kayıtlı Adreslerim</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedAddresses.map(address => (
                  <button
                    key={address.id}
                    onClick={() => handleSelectAddress(address)}
                    className={clsx(
                      "border p-4 rounded-lg text-left transition-all",
                      selectedAddressId === address.id
                        ? "border-gray-800 ring-2 ring-gray-800"
                        : "border-gray-200 hover:border-gray-400"
                    )}
                  >
                    <p className="font-bold">{address.fullName}</p>
                    <p className="text-sm text-gray-600">{address.phoneNumber}</p>
                    <p className="text-sm text-gray-600">{address.address1}</p>
                    <p className="text-sm text-gray-600">{address.district}, {address.city}</p>
                  </button>
                ))}
              </div>
              <div className="my-6 text-center text-gray-500">
                <span className="bg-gray-50 px-2">veya yeni adres girin</span>
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold text-gray-800 mb-6">Teslimat Adresi</h2>

          {/* 🔸 Misafir ise email alanı */}
          {!user && (
            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
              <label className="block text-sm font-medium text-gray-700">E-posta</label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className={inputStyle}
                placeholder="ornek@mail.com"
              />
              <p className="mt-1 text-xs text-gray-500">Ödeme ve bildirimler için gereklidir.</p>
            </div>
          )}

          <form
            id="checkout-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 bg-white p-8 rounded-lg shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                <input type="text" {...register("fullName")} className={inputStyle} />
                {errors.fullName && <p className="mt-2 text-sm text-red-600">{errors.fullName.message}</p>}
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Telefon Numarası</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-500">+90</span>
                  <input type="tel" {...register("phoneNumber")} className={`${inputStyle} pl-10`} placeholder="5xxxxxxxxx" />
                </div>
                {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="address1" className="block text-sm font-medium text-gray-700">Adres Satırı</label>
              <textarea {...register("address1")} rows={3} className={inputStyle} placeholder="Mahalle, Sokak, No..." />
              {errors.address1 && <p className="mt-2 text-sm text-red-600">{errors.address1.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700">Şehir</label>
                <input type="text" {...register("city")} className={inputStyle} />
                {errors.city && <p className="mt-2 text-sm text-red-600">{errors.city.message}</p>}
              </div>
              <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700">İlçe</label>
                <input type="text" {...register("district")} className={inputStyle} />
                {errors.district && <p className="mt-2 text-sm text-red-600">{errors.district.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Posta Kodu</label>
              <input type="text" {...register("postalCode")} className={inputStyle} />
              {errors.postalCode && <p className="mt-2 text-sm text-red-600">{errors.postalCode.message}</p>}
            </div>

            {/* 🔸 Kargo firması seçimi */}
            <div className="pt-4 border-t">
              <CarrierSelect
                value={preferredCarrier}
                onChange={(v) => {
                  setPreferredCarrier(v);
                  if (!carrierTouched) setCarrierTouched(true);
                }}
              />
              {carrierTouched && !preferredCarrier && (
                <p className="text-xs text-red-600 mt-2">Kargo firması seçimi zorunludur.</p>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm self-start">
          <h2 className="text-lg font-medium text-gray-900">Sipariş Özeti</h2>
          <dl className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <dt className="text-sm text-gray-600">Ara Toplam</dt>
              <dd className="text-sm font-medium text-gray-900">{subtotal.toFixed(2)} TL</dd>
            </div>
            {discountAmount > 0 && (
  <div className="flex items-center justify-between text-green-600">
    <dt className="text-sm">
      İndirim {cart?.appliedCouponCode ? `(${cart.appliedCouponCode})` : ""}
    </dt>
    <dd className="text-sm font-medium">-{discountAmount.toFixed(2)} TL</dd>
  </div>
)}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="text-sm text-gray-600">Kargo Ücreti</dt>
              <dd className="text-sm font-medium text-gray-900">
                {settingsLoading ? 'Hesaplanıyor...' : (shippingFee === 0 ? "Ücretsiz" : `${shippingFee.toFixed(2)} TL`)}
              </dd>
            </div>
            {/* Bilgi amaçlı: seçilen kargo */}
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="text-sm text-gray-600">Kargo Firması</dt>
              <dd className="text-sm font-medium text-gray-900">{preferredCarrier ?? "Seçilmedi"}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <dt className="text-base font-medium text-gray-900">Toplam</dt>
              <dd className="text-base font-medium text-gray-900">
                {settingsLoading ? 'Hesaplanıyor...' : `${total.toFixed(2)} TL`}
              </dd>
            </div>
          </dl>

          <button
            type="submit"
            form="checkout-form"
            disabled={isSubmitting || (!user && !guestEmail) || !preferredCarrier}
            className="w-full mt-6 rounded-md border border-transparent bg-gray-900 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-700 disabled:bg-gray-400"
            title={
              !user && !guestEmail
                ? "Misafir ödeme için e-posta gerekli"
                : !preferredCarrier
                ? "Lütfen kargo firması seçin"
                : ""
            }
          >
            {isSubmitting ? "İşleniyor..." : "Siparişi Tamamla ve Ödemeye Geç"}
          </button>
        </div>
      </div>
    </div>
  );
}