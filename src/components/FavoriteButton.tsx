// src/components/FavoriteButton.tsx
'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import clsx from 'clsx';

interface FavoriteButtonProps {
  product: Product;
  // Bileşenin farklı yerlerde farklı stiller alabilmesi için className prop'u ekliyoruz
  className?: string;
}

export default function FavoriteButton({ product, className }: FavoriteButtonProps) {
  const { isFavorite, toggleFavoriteStatus } = useFavorites();
  const { user } = useAuth();
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

    if (!isFavorited) {
      setIsAnimating(true);
    }
    toggleFavoriteStatus(product);
  };

  const handleAnimationEnd = () => {
    setIsAnimating(false);
  };

  return (
    <button
      onClick={handleFavoriteClick}
      onAnimationEnd={handleAnimationEnd}
      className={clsx(
        "p-2 rounded-full transition-transform active:scale-90 z-10", // Temel stiller
        className // Dışarıdan gelen ek stiller
      )}
      aria-label={isFavorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
    >
      <Heart
        size={22} // İkonu biraz büyüttük
        className={clsx('text-gray-700 transition-colors', {
          'fill-red-500 text-red-500': isFavorited,
          'animate-heartbeat': isAnimating,
        })}
      />
    </button>
  );
}