// src/app/hesabim/page.tsx
'use client';

import { useAuth } from "@/context/AuthContext";
import { getOrders, getAddresses, addAddress, updateAddress, deleteAddress, changePassword } from "@/lib/api";
import { Order, Address, ShippingAddress, ChangePasswordData } from "@/types";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, User as UserIcon, MapPin, LogOut, Edit, Trash2 } from "lucide-react";
import clsx from 'clsx';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// --- Form Şemaları ve Stiller ---
const addressSchema = z.object({
    fullName: z.string().min(3, "Ad Soyad gereklidir."),
    phoneNumber: z.string().min(10, "Telefon numarası 10 haneli olmalıdır.").max(10, "Telefon numarası 10 haneli olmalıdır.").regex(/^[0-9]+$/, "Sadece rakam giriniz."),
    address1: z.string().min(10, "Adres gereklidir."),
    address2: z.string().optional(),
    city: z.string().min(2, "Şehir gereklidir."),
    district: z.string().min(2, "İlçe gereklidir."),
    postalCode: z.string().min(5, "Posta kodu gereklidir.").max(5, "Posta kodu 5 haneli olmalıdır."),
    country: z.string().min(2, "Ülke gereklidir."),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, "Mevcut şifre gereklidir."),
    newPassword: z.string().min(6, "Yeni şifre en az 6 karakter olmalıdır."),
    confirmNewPassword: z.string()
}).refine(data => data.newPassword === data.confirmNewPassword, {
    message: "Yeni şifreler eşleşmiyor.",
    path: ["confirmNewPassword"],
});

const inputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A58E74] focus:ring-[#A58E74] p-2 text-sm";
const buttonPrimaryStyle = "bg-[#2a2a2a] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 disabled:bg-zinc-400 transition-colors";
const buttonSecondaryStyle = "bg-zinc-200 text-zinc-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-300 transition-colors";

// --- Sipariş Listesi Bileşeni ---
const OrderList = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            const fetchedOrders = await getOrders();
            setOrders(fetchedOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
            setLoading(false);
        };
        fetchOrders();
    }, []);

    const translateStatus = (status: string) => {
        switch(status) {
            case 'PaymentSucceeded': return 'Ödeme Başarılı';
            case 'Shipped': return 'Kargoya Verildi';
            case 'Delivered': return 'Teslim Edildi';
            default: return 'Hazırlanıyor';
        }
    }

    if (loading) return <p>Siparişler yükleniyor...</p>;

    return (
  <div>
    {orders.length > 0 ? (
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div>
                <p className="font-bold text-zinc-800">Sipariş #{order.id}</p>
                <p className="text-sm text-zinc-500">
                  Tarih: {new Date(order.orderDate).toLocaleDateString("tr-TR")}
                </p>
              </div>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  order.orderStatus === "Delivered"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {translateStatus(order.orderStatus)}
              </span>
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4">
              {order.orderItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center space-x-4 py-2"
                >
                  <p className="flex-grow font-medium text-zinc-700">
                    {item.productName}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {item.quantity} x {item.price.toFixed(2)} TL
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4 text-right">
              <p className="font-semibold text-zinc-900">
                Toplam: {(order.subtotal + order.shippingFee).toFixed(2)} TL
              </p>
            </div>

            {/* === Kargo Bilgisi & Takip === */}
            <div className="mt-3">
              {order.trackingNumber ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="text-sm text-zinc-600 text-left">
                    Kargo:{" "}
                    <span className="font-medium">
                      {order.cargoCompany || "-"}
                    </span>
                    {" "}•{" "}
                    Takip No:{" "}
                    <span className="font-mono">{order.trackingNumber}</span>
                  </div>

                  <Link
                    href={`/kargo-takip?no=${encodeURIComponent(
                      order.trackingNumber
                    )}`}
                    className="inline-flex items-center justify-center rounded-md bg-[#2a2a2a] px-3 py-1.5 text-sm font-medium text-white hover:bg-opacity-90"
                  >
                    Kargoyu Takip Et
                  </Link>
                </div>
              ) : (
                <div className="text-sm text-zinc-500">
                  Kargo bilgisi henüz eklenmedi.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-zinc-500 text-center py-10">
        Henüz hiç sipariş vermediniz.
      </p>
    )}
  </div>
);
};

// --- Adreslerim Bileşeni ---
// +90 / 0 / boşluk / tire vs. temizleyip son 10 haneyi bırak
function normalizeTRPhone(input?: string) {
  if (!input) return "";
  const digits = input.replace(/\D/g, "");           // sadece rakam
  const withoutCC = digits.replace(/^90/, "");       // baştaki 90'ı at
  const withoutZero = withoutCC.replace(/^0/, "");   // baştaki 0'ı at
  return withoutZero.slice(-10);                     // son 10 haneyi al
}

const AddressManager = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShippingAddress>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "Türkiye", phoneNumber: "" },
  });

  const fetchAddresses = async () => {
    setLoading(true);
    const fetchedAddresses = await getAddresses();
    setAddresses(fetchedAddresses);
    setLoading(false);
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleEditClick = (address: Address) => {
    setEditingAddress(address);
    reset({ ...address, phoneNumber: normalizeTRPhone(address.phoneNumber) });
    setShowForm(true);
  };

  const handleDeleteClick = async (addressId: number) => {
    if (window.confirm("Bu adresi silmek istediğinizden emin misiniz?")) {
      const success = await deleteAddress(addressId);
      if (success) {
        setAddresses((prev) => prev.filter((a) => a.id !== addressId));
      } else {
        alert("Adres silinirken bir hata oluştu.");
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
    reset({
      country: "Türkiye",
      fullName: "",
      phoneNumber: "",
      address1: "",
      city: "",
      district: "",
      postalCode: "",
    });
  };

  const onSubmit = async (data: ShippingAddress) => {
    // telefonu temizle
    const cleanPhone = normalizeTRPhone(data.phoneNumber);
    const payload = { ...data, phoneNumber: cleanPhone };

    let success = false;
    if (editingAddress) {
      success = await updateAddress({ ...editingAddress, ...payload });
    } else {
      const newAddress = await addAddress(payload);
      if (newAddress) {
        setAddresses((prev) => [...prev, newAddress]);
        success = true;
      }
    }

    if (success) {
      await fetchAddresses();
      handleCancel();
    } else {
      alert("İşlem sırasında bir hata oluştu.");
    }
  };

  // 🔑 Manuel tetikleyici: olası overlay/native validation sorunlarını by-pass eder
  const submitForm = () => {
    handleSubmit(onSubmit)();
  };

  if (loading) return <p>Adresler yükleniyor...</p>;

  return (
    <div>
      <div className="flex justify-end items-center mb-6">
        {!showForm && (
          <button
            type="button" // submit olmasın
            onClick={() => setShowForm(true)}
            className="text-sm font-medium text-[#A58E74] hover:opacity-80 transition-colors"
          >
            + Yeni Adres Ekle
          </button>
        )}
      </div>

      {showForm && (
        <form
          id="address-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4 bg-zinc-50 p-6 rounded-lg mb-8 border border-gray-200"
        >
          <h3 className="text-lg font-medium text-zinc-800">
            {editingAddress ? "Adresi Düzenle" : "Yeni Adres Bilgileri"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="text-sm font-medium text-zinc-700">
                Ad Soyad
              </label>
              <input type="text" {...register("fullName")} className={inputStyle} />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="phoneNumber" className="text-sm font-medium text-zinc-700">
                Telefon Numarası
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-zinc-500">
                  +90
                </span>
                <input
                  type="tel"
                  {...register("phoneNumber")}
                  className={`${inputStyle} pl-10`}
                  placeholder="5xxxxxxxxx"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                />
              </div>
              {errors.phoneNumber && (
                <p className="mt-1 text-xs text-red-500">{errors.phoneNumber.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="address1" className="text-sm font-medium text-zinc-700">
              Adres
            </label>
            <textarea
              {...register("address1")}
              rows={3}
              className={inputStyle}
              placeholder="Mahalle, Sokak, No..."
            />
            {errors.address1 && (
              <p className="mt-1 text-xs text-red-500">{errors.address1.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="text-sm font-medium text-zinc-700">
                Şehir
              </label>
              <input type="text" {...register("city")} className={inputStyle} />
              {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
            </div>
            <div>
              <label htmlFor="district" className="text-sm font-medium text-zinc-700">
                İlçe
              </label>
              <input type="text" {...register("district")} className={inputStyle} />
              {errors.district && (
                <p className="mt-1 text-xs text-red-500">{errors.district.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="postalCode" className="text-sm font-medium text-zinc-700">
              Posta Kodu
            </label>
            <input type="text" {...register("postalCode")} className={inputStyle} />
            {errors.postalCode && (
              <p className="mt-1 text-xs text-red-500">{errors.postalCode.message}</p>
            )}
          </div>

          <div className="flex gap-4 pt-2">
            {/* type="button" + manuel tetikleme → tıklama sorunlarını aşar */}
            <button
              type="button"
              onClick={submitForm}
              disabled={isSubmitting}
              className={`${buttonPrimaryStyle} relative z-50 pointer-events-auto`}
            >
              {isSubmitting ? "Kaydediliyor..." : "Adresi Kaydet"}
            </button>
            <button type="button" onClick={handleCancel} className={buttonSecondaryStyle}>
              İptal
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <div
              key={address.id}
              className="border border-gray-200 p-4 rounded-md bg-white flex justify-between items-start hover:shadow-sm transition-shadow"
            >
              <div>
                <p className="font-bold text-zinc-800">{address.fullName}</p>
                <p className="text-sm text-zinc-600">{address.phoneNumber}</p>
                <p className="text-sm text-zinc-600 mt-1">{address.address1}</p>
                <p className="text-sm text-zinc-600">
                  {address.district}, {address.city}, {address.postalCode}
                </p>
              </div>
              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => handleEditClick(address)}
                  className="text-zinc-500 hover:text-[#A58E74]"
                >
                  <Edit size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteClick(address.id)}
                  className="text-zinc-500 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          !showForm && (
            <p className="text-zinc-500 text-center py-10">Kayıtlı adresiniz bulunmamaktadır.</p>
          )
        )}
      </div>
    </div>
  );
};

// --- Profil Bilgileri Bileşeni ---
const ProfileInfo = () => {
    const { user } = useAuth();
    const [serverMessage, setServerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ChangePasswordData>({
        resolver: zodResolver(passwordSchema)
    });

    const onSubmit = async (data: ChangePasswordData) => {
        setServerMessage(null);
        const result = await changePassword(data);
        setServerMessage({
            type: result.success ? 'success' : 'error',
            text: result.message
        });

        if (result.success) {
            reset();
        }
    };

    return (
        <div className="divide-y divide-gray-200">
            <div className="space-y-4 pb-8">
                <div>
                    <label className="text-sm font-medium text-zinc-500">Kullanıcı Adı</label>
                    <p className="text-zinc-800 mt-1">{user?.username}</p>
                </div>
                 <div>
                    <label className="text-sm font-medium text-zinc-500">E-posta</label>
                    <p className="text-zinc-800 mt-1">{user?.email}</p>
                </div>
            </div>

            <div className="pt-8">
                <h3 className="text-lg font-medium text-zinc-800">Parola Değiştir</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4 max-w-md">
                    <div>
                        <label htmlFor="currentPassword" className="text-sm font-medium text-zinc-700">Mevcut Parola</label>
                        <input type="password" {...register("currentPassword")} className={inputStyle} />
                        {errors.currentPassword && <p className="mt-1 text-xs text-red-500">{errors.currentPassword.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="newPassword" className="text-sm font-medium text-zinc-700">Yeni Parola</label>
                        <input type="password" {...register("newPassword")} className={inputStyle} />
                        {errors.newPassword && <p className="mt-1 text-xs text-red-500">{errors.newPassword.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="confirmNewPassword" className="text-sm font-medium text-zinc-700">Yeni Parola (Tekrar)</label>
                        <input type="password" {...register("confirmNewPassword")} className={inputStyle} />
                        {errors.confirmNewPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmNewPassword.message}</p>}
                    </div>

                    {serverMessage && (
                        <div className={`p-3 rounded-md text-sm ${serverMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {serverMessage.text}
                        </div>
                    )}

                    <div className="pt-2">
                        <button type="submit" disabled={isSubmitting} className={buttonPrimaryStyle}>
                            {isSubmitting ? "Güncelleniyor..." : "Parolayı Güncelle"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Ana Hesabım Sayfası ---
export default function AccountPage() {
    const { user, logout, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    if (authLoading) {
        return <div className="text-center pt-48">Yükleniyor...</div>;
    }

    if (!user) {
        return (
            <div className="text-center pt-48">
                <p>Bu sayfayı görüntülemek için lütfen giriş yapın.</p>
                <Link href="/giris" className="text-[#A58E74] hover:underline mt-2 inline-block">Giriş Yap</Link>
            </div>
        );
    }

    const menuItems = [
        { id: 'profile', label: 'Profil Bilgileri', icon: UserIcon },
        { id: 'addresses', label: 'Adreslerim', icon: MapPin },
        { id: 'orders', label: 'Siparişlerim', icon: Package },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile': return <ProfileInfo />;
            case 'addresses': return <AddressManager />;
            case 'orders': return <OrderList />;
            default: return null;
        }
    };
    
    const capitalizedUsername = user.username.charAt(0).toUpperCase() + user.username.slice(1);

    return (
        <div className="bg-[#FAF7F5] min-h-screen pt-40 pb-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold text-zinc-800">Hoş Geldin, {capitalizedUsername}!</h1>
                    <p className="mt-2 text-lg text-zinc-600">Hesap bilgilerini ve sipariş geçmişini buradan yönetebilirsin.</p>
                </div>
                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
                    <aside className="lg:col-span-3">
                        <nav className="space-y-1">
                            {menuItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={clsx(
                                        "group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left transition-colors",
                                        activeTab === item.id 
                                            ? 'bg-[#2a2a2a] text-white' 
                                            : 'text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                                    )}
                                >
                                    <item.icon className={clsx("mr-3 h-5 w-5 flex-shrink-0", activeTab === item.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-500')} />
                                    <span className="truncate">{item.label}</span>
                                </button>
                            ))}
                             <button
                                onClick={logout}
                                className="group flex items-center px-3 py-2 text-sm font-medium rounded-md w-full text-left text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 transition-colors"
                            >
                                <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-zinc-400 group-hover:text-zinc-500" />
                                <span className="truncate">Çıkış Yap</span>
                            </button>
                        </nav>
                    </aside>
                    <div className="lg:col-span-9 mt-12 lg:mt-0">
                         <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
                            <h2 className="text-2xl font-semibold text-zinc-800 mb-6">
                                {menuItems.find(item => item.id === activeTab)?.label}
                            </h2>
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
