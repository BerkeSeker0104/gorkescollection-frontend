'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Trash2 } from 'lucide-react';

import { getAddresses, addAddress, updateAddress, deleteAddress } from '@/lib/api';
import type { Address, ShippingAddress } from '@/types';
import { addressSchema } from "../../lib/validation";

const inputStyle = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#A58E74] focus:ring-[#A58E74] p-2 text-sm";
const buttonPrimaryStyle = "bg-[#2a2a2a] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-opacity-90 disabled:bg-zinc-400 transition-colors";
const buttonSecondaryStyle = "bg-zinc-200 text-zinc-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-300 transition-colors";

// +90 / 0 / boşluk / tire vs. temizleyip son 10 haneyi bırak
function normalizeTRPhone(input?: string) {
  if (!input) return '';
  const digits = input.replace(/\D/g, '');
  const withoutCC = digits.replace(/^90/, '');
  const withoutZero = withoutCC.replace(/^0/, '');
  return withoutZero.slice(-10);
}

export default function AddressManager() {
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
    defaultValues: { country: 'Türkiye', fullName: '', phoneNumber: '', address1: '', city: '', district: '', postalCode: '' },
  });

  const fetchAddresses = async () => {
    setLoading(true);
    const fetched = await getAddresses();
    setAddresses(fetched);
    setLoading(false);
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (editingAddress) {
      reset({ ...editingAddress, phoneNumber: normalizeTRPhone(editingAddress.phoneNumber) });
    } else {
      reset({ country: 'Türkiye', fullName: '', phoneNumber: '', address1: '', city: '', district: '', postalCode: '' });
    }
  }, [editingAddress, reset]);

  const handleEditClick = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDeleteClick = async (addressId: number) => {
    if (!window.confirm('Bu adresi silmek istediğinizden emin misiniz?')) return;
    const success = await deleteAddress(addressId);
    if (success) setAddresses((prev) => prev.filter((a) => a.id !== addressId));
    else alert('Adres silinirken bir hata oluştu.');
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
    reset({ country: 'Türkiye', fullName: '', phoneNumber: '', address1: '', city: '', district: '', postalCode: '' });
  };

  const onSubmit = async (data: ShippingAddress) => {
    const cleanPhone = normalizeTRPhone(data.phoneNumber);
    const payload = { ...data, phoneNumber: cleanPhone };

    let success = false;
    if (editingAddress) {
      // api.ts --> updateAddress(path: /api/account/addresses/${id}) yaptınız ✅
      success = await updateAddress({ ...editingAddress, ...payload });
    } else {
      const created = await addAddress(payload);
      if (created) {
        setAddresses((prev) => [...prev, created]);
        success = true;
      }
    }

    if (success) {
      await fetchAddresses();
      handleCancel();
    } else {
      alert('İşlem sırasında bir hata oluştu.');
    }
  };

  if (loading) return <p>Adresler yükleniyor...</p>;

  return (
    <div className="relative">
      <div className="flex justify-end items-center mb-6">
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-sm font-medium text-[#A58E74] hover:opacity-80 transition-colors"
          >
            + Yeni Adres Ekle
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)} // Enter ile çalışsın
          noValidate
          className="space-y-4 bg-zinc-50 p-6 rounded-lg mb-8 border border-gray-200"
          style={{ position: 'relative', zIndex: 50, pointerEvents: 'auto' }}
        >
          <h3 className="text-lg font-medium text-zinc-800">
            {editingAddress ? 'Adresi Düzenle' : 'Yeni Adres Bilgileri'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-700">Ad Soyad</label>
              <input type="text" {...register('fullName')} className={inputStyle} />
              {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700">Telefon Numarası</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-zinc-500">+90</span>
                <input
                  type="tel"
                  {...register('phoneNumber')}
                  className={`${inputStyle} pl-10`}
                  placeholder="5xxxxxxxxx"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                />
              </div>
              {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700">Adres</label>
            <textarea {...register('address1')} rows={3} className={inputStyle} placeholder="Mahalle, Sokak, No..." />
            {errors.address1 && <p className="mt-1 text-xs text-red-500">{errors.address1.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-700">Şehir</label>
              <input type="text" {...register('city')} className={inputStyle} />
              {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-700">İlçe</label>
              <input type="text" {...register('district')} className={inputStyle} />
              {errors.district && <p className="mt-1 text-xs text-red-500">{errors.district.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700">Posta Kodu</label>
            <input type="text" {...register('postalCode')} className={inputStyle} />
            {errors.postalCode && <p className="mt-1 text-xs text-red-500">{errors.postalCode.message}</p>}
          </div>

          <div className="flex gap-4 pt-2">
            {/* RHF'yi doğrudan tetikle, isDirty kilidi YOK */}
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSubmit(onSubmit)(); }}
              disabled={isSubmitting}
              className={buttonPrimaryStyle}
            >
              {isSubmitting ? 'Kaydediliyor...' : 'Adresi Kaydet'}
            </button>

            <button type="button" onClick={() => handleCancel()} className={buttonSecondaryStyle}>
              İptal
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <div key={address.id} className="border border-gray-200 p-4 rounded-md bg-white flex justify-between items-start hover:shadow-sm transition-shadow">
              <div>
                <p className="font-bold text-zinc-800">{address.fullName}</p>
                <p className="text-sm text-zinc-600">{address.phoneNumber}</p>
                <p className="text-sm text-zinc-600 mt-1">{address.address1}</p>
                <p className="text-sm text-zinc-600">
                  {address.district}, {address.city}, {address.postalCode}
                </p>
              </div>
              <div className="flex gap-3 mt-1">
                <button type="button" onClick={() => handleEditClick(address)} className="text-zinc-500 hover:text-[#A58E74]">
                  <Edit size={16} />
                </button>
                <button type="button" onClick={() => handleDeleteClick(address.id)} className="text-zinc-500 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          !showForm && <p className="text-zinc-500 text-center py-10">Kayıtlı adresiniz bulunmamaktadır.</p>
        )}
      </div>
    </div>
  );
}
