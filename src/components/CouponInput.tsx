'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Tag } from 'lucide-react';

const CouponInput = () => {
  const { applyCouponCode, loading } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showInput, setShowInput] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setMessage(null);
    const result = await applyCouponCode(couponCode);
    setMessage({ text: result.message, type: result.success ? 'success' : 'error' });
    if (result.success) {
      // Başarılı olunca input'u gizle ve kodu temizle
      setShowInput(false);
      setCouponCode('');
    }
  };

  if (!showInput) {
    return (
      <button
        onClick={() => setShowInput(true)}
        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 w-full text-left mt-4"
      >
        İndirim kodunuz var mı?
      </button>
    );
  }

  return (
    <div className="mt-6">
      <label htmlFor="coupon-code" className="block text-sm font-medium text-gray-700">
        İndirim Kodu
      </label>
      <div className="mt-1 flex rounded-md shadow-sm">
        <div className="relative flex flex-grow items-stretch focus-within:z-10">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Tag className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            name="coupon-code"
            id="coupon-code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="block w-full rounded-none rounded-l-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="HOSGELDIN10"
          />
        </div>
        <button
          type="button"
          onClick={handleApplyCoupon}
          disabled={loading}
          className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
        >
          {loading ? '...' : 'Uygula'}
        </button>
      </div>
      {message && (
        <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
    </div>
  );
};

export default CouponInput;
