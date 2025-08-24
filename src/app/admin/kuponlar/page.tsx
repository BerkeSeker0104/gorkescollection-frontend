'use client';

import { useEffect, useState } from 'react';
import { Coupon } from '@/types';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/lib/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import CouponForm, { CouponFormData } from '@/components/admin/CouponForm';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = async () => {
    setLoading(true);
    const data = await getCoupons();
    setCoupons(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenModal = (coupon: Coupon | null = null) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = async (data: CouponFormData, couponId?: number) => {
    setError(null);
    try {
      if (couponId) {
        // Güncelleme
        const payload: Coupon = { ...data, id: couponId, timesUsed: editingCoupon?.timesUsed || 0 };
        await updateCoupon(couponId, payload);
      } else {
        // Oluşturma
        await createCoupon(data);
      }
      handleCloseModal();
      await fetchCoupons(); // Listeyi yenile
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    }
  };

  const handleDelete = async (couponId: number) => {
    if (window.confirm('Bu kuponu silmek istediğinizden emin misiniz?')) {
      await deleteCoupon(couponId);
      await fetchCoupons(); // Listeyi yenile
    }
  };

  if (loading) return <p>Kuponlar yükleniyor...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kupon Yönetimi</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700"
        >
          <Plus size={16} />
          Yeni Kupon Ekle
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kod</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">İndirim</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanım</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Son Tarih</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{coupon.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {coupon.discountValue} {coupon.discountType === 'Percentage' ? '%' : 'TL'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {coupon.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {coupon.timesUsed} / {coupon.usageLimit || '∞'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString('tr-TR') : 'Yok'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleOpenModal(coupon)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(coupon.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CouponForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={editingCoupon}
      />
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
