// src/components/StockNotificationButton.tsx

'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { subscribeToStockNotification } from '@/lib/api';

export default function StockNotificationButton({ productId }: { productId: number }) {
  const { user } = useAuth();

  // Component'in durumunu yönetmek için: 'idle', 'form', 'loading', 'success', 'error'
  const [status, setStatus] = useState<'idle' | 'form' | 'loading' | 'success' | 'error'>('idle');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      setMessage('Lütfen geçerli bir e-posta adresi girin.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    const result = await subscribeToStockNotification(productId, email);
    
    setMessage(result.message);
    setStatus(result.success ? 'success' : 'error');
  };

  // Eğer durum başlangıç halindeyse (idle), ana butonu göster
  if (status === 'idle') {
    return (
      <button
        type="button"
        onClick={() => setStatus(user ? 'form' : 'form')} // Kullanıcı giriş yapmışsa da formu gösterelim
        className="w-full bg-gray-500 text-white px-4 py-3 rounded-md font-semibold hover:bg-gray-600 transition-colors"
      >
        Stoğa Gelince Haber Ver
      </button>
    );
  }

  // Eğer işlem başarılı olduysa veya hata varsa, sadece mesajı göster
  if (status === 'success' || status === 'error') {
    return (
      <div className={`p-3 text-center rounded-md text-sm ${
          status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {message}
      </div>
    );
  }

  // E-posta girme formu veya yüklenme durumu
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-gray-600">
        Ürün stoğa girdiğinde size haber vermemiz için e-posta adresinizi girin.
      </p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-posta adresiniz"
        required
        disabled={!!user || status === 'loading'} // Kullanıcı giriş yapmışsa e-postayı değiştiremez
        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-gray-800 focus:border-gray-800"
      />
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={status === 'loading'}
          className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-md font-semibold hover:bg-black transition-colors disabled:bg-gray-400"
        >
          {status === 'loading' ? 'Gönderiliyor...' : 'İsteğimi Gönder'}
        </button>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          disabled={status === 'loading'}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300"
        >
          Vazgeç
        </button>
      </div>
    </form>
  );
}