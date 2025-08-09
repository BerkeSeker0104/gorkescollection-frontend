'use client';

import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { isFavorite, toggleFavoriteStatus } = useFavorites();
  const { user } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(false);

  const isFavorited = isFavorite(product.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/giris');
      return;
    }

    if (!isFavorited) setIsAnimating(true);
    toggleFavoriteStatus(product);
  };

  const handleAnimationEnd = () => setIsAnimating(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id);
    // burada istersen kısa bir toast tetikleyebiliriz
  };

  // ✔️ Görsel kaynağı: ilk URL; yoksa placeholder
  const thumb =
    (product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : null) ||
    `https://placehold.co/400x400/F7F5F2/333333.png?text=${encodeURIComponent(product.name)}`;

  // (Opsiyonel) Fiyatı TR formatında göster
  const priceText =
    typeof product.price === 'number'
      ? product.price.toLocaleString('tr-TR', {
          style: 'currency',
          currency: 'TRY',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : `${product.price} TL`;

  return (
    <div className="group relative">
      <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-200 lg:h-80 relative">
        <Image
          src={thumb}
          alt={product.name}
          width={400}
          height={400}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />

        {/* Favori */}
        <button
          onClick={handleFavoriteClick}
          onAnimationEnd={handleAnimationEnd}
          className="absolute top-3 right-3 p-2 bg-white/70 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
          aria-label={isFavorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        >
          <Heart
            size={20}
            className={clsx('text-gray-700 transition-colors', {
              'fill-red-500 text-red-500': isFavorited,
              'animate-heartbeat': isAnimating,
            })}
          />
        </button>

        {/* Sepete Ekle - Desktop: hover ile görünür */}
        <button
          onClick={handleAddToCart}
          className="hidden md:flex absolute left-3 right-3 bottom-3 items-center justify-center gap-2 rounded-md bg-gray-900/90 text-white py-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          aria-label="Sepete ekle"
        >
          <ShoppingBag size={18} />
          <span className="text-sm font-medium">Sepete Ekle</span>
        </button>

        {/* Sepete Ekle - Mobil: her zaman küçük buton */}
        <button
          onClick={handleAddToCart}
          className="md:hidden absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/90 px-3 py-1.5 text-gray-800 shadow-sm"
          aria-label="Sepete ekle"
        >
          <ShoppingBag size={18} />
          <span className="text-xs font-medium">Sepet</span>
        </button>
      </div>

      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">
            <Link href={`/urun/${product.id}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {product.name}
            </Link>
          </h3>
        </div>
        <p className="text-sm font-medium text-gray-900">{priceText}</p>
      </div>
    </div>
  );
};

export default ProductCard;
