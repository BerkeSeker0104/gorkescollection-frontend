'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Coupon } from '@/types';

// Form verileri için tip tanımı
export type CouponFormData = {
  code: string;
  discountType: 'Percentage' | 'Amount';
  discountValue: number;
  expiryDate?: string | null;
  usageLimit?: number | null;
  isActive: boolean;
};

// Form doğrulama şeması
const couponSchema = z.object({
  code: z.string().min(3, 'Kupon kodu en az 3 karakter olmalıdır.').toUpperCase(),
  discountType: z.enum(['Percentage', 'Amount']),
  discountValue: z.number().min(0, 'İndirim değeri 0\'dan küçük olamaz.'),
  expiryDate: z.string().nullable().optional(),
  usageLimit: z.number().min(0, 'Limit 0\'dan küçük olamaz.').nullable().optional(),
  isActive: z.boolean(),
});

interface CouponFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CouponFormData, couponId?: number) => Promise<void>;
  initialData?: Coupon | null;
}

const CouponForm = ({ isOpen, onClose, onSubmit, initialData }: CouponFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: initialData?.code || '',
      discountType: initialData?.discountType || 'Percentage',
      discountValue: initialData?.discountValue || 0,
      expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate).toISOString().slice(0, 16) : null,
      usageLimit: initialData?.usageLimit || null,
      isActive: initialData?.isActive ?? true,
    },
  });

  const discountType = watch('discountType');

  const handleFormSubmit: SubmitHandler<CouponFormData> = async (data) => {
    await onSubmit(data, initialData?.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800">
              {initialData ? 'Kuponu Düzenle' : 'Yeni Kupon Oluştur'}
            </h2>
            <div className="mt-6 space-y-4">
              {/* Kupon Kodu */}
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700">Kupon Kodu</label>
                <input type="text" {...register('code')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>}
              </div>

              {/* İndirim Tipi ve Değeri */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="discountType" className="block text-sm font-medium text-gray-700">İndirim Tipi</label>
                  <select {...register('discountType')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                    <option value="Percentage">Yüzde (%)</option>
                    <option value="Amount">Sabit Tutar (TL)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700">Değer</label>
                  <input type="number" step="0.01" {...register('discountValue', { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                  {errors.discountValue && <p className="mt-1 text-xs text-red-500">{errors.discountValue.message}</p>}
                </div>
              </div>

              {/* Son Kullanma Tarihi */}
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Son Kullanma Tarihi (Opsiyonel)</label>
                <input type="datetime-local" {...register('expiryDate')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
              </div>

              {/* Kullanım Limiti */}
              <div>
                <label htmlFor="usageLimit" className="block text-sm font-medium text-gray-700">Kullanım Limiti (Opsiyonel, boş bırakırsanız limitsiz)</label>
                <input type="number" {...register('usageLimit', { setValueAs: v => v === '' ? null : parseInt(v, 10) })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                {errors.usageLimit && <p className="mt-1 text-xs text-red-500">{errors.usageLimit.message}</p>}
              </div>

              {/* Aktif mi? */}
              <div className="flex items-center">
                <input id="isActive" type="checkbox" {...register('isActive')} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Kupon Aktif</label>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Vazgeç
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-gray-800 border border-transparent rounded-md hover:bg-gray-700 disabled:bg-gray-400">
              {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponForm;
