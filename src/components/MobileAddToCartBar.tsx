'use client';

import { Product } from '@/types';
import AddToCartButton from './AddToCartButton';
import StockNotificationButton from './StockNotificationButton';

// Bu component, ürün bilgilerini prop olarak alacak
const MobileAddToCartBar = ({ product }: { product: Product }) => {
  // Eğer ürün bilgisi yoksa, hiçbir şey gösterme
  if (!product) {
    return null;
  }

  return (
    // md:hidden -> Sadece mobil (medium ekrandan küçük) cihazlarda görünür
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-40">
      <div className="flex justify-between items-center gap-4">
        {/* Sol Taraf: Fiyat */}
        <div className="flex-shrink-0">
          <p className="text-xl font-bold text-gray-900">
            {/* Fiyatı formatlayarak gösteriyoruz */}
            {product.price.toLocaleString('tr-TR', {
              style: 'currency',
              currency: 'TRY',
            })}
          </p>
        </div>

        {/* Sağ Taraf: Buton (Stok durumuna göre) */}
        <div className="flex-1">
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
