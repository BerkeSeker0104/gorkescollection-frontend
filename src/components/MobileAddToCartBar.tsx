'use client';

import { Product } from '@/types';
import AddToCartButton from './AddToCartButton';
import StockNotificationButton from './StockNotificationButton';
import Image from 'next/image'; // Image component'ini import ediyoruz

// Bu component, ürün bilgilerini ve WhatsApp numarasını prop olarak alacak
const MobileAddToCartBar = ({ product, phoneNumber }: { product: Product, phoneNumber: string }) => {
  if (!product) {
    return null;
  }

  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    // md:hidden -> Sadece mobil (medium ekrandan küçük) cihazlarda görünür
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-3 border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-40">
      <div className="flex justify-between items-center gap-3">
        
        {/* Sol Taraf: Fiyat ve WhatsApp Butonu */}
        <div className="flex items-center gap-4">
          {/* --- DEĞİŞİKLİK BURADA --- */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp üzerinden soru sorun"
            className="flex-shrink-0 transition-transform transform hover:scale-110"
          >
            <Image
              src="/whatsapp.png"
              alt="WhatsApp ile soru sor"
              width={24}
              height={24}
              className="w-10 h-10"
            />
          </a>
          <div>
            <span className="text-xs text-gray-500">Fiyat</span>
            <p className="text-lg font-bold text-gray-900 leading-tight">
              {product.price.toLocaleString('tr-TR', {
                style: 'currency',
                currency: 'TRY',
              })}
            </p>
          </div>
        </div>

        {/* Sağ Taraf: Ana Eylem Butonu (Stok durumuna göre) */}
        <div className="flex-1 max-w-[180px]">
          {product.stockQuantity > 0 ? (
            <AddToCartButton productId={product.id} />
          ) : (
            <StockNotificationButton productId={product.id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileAddToCartBar;
