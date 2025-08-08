'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product } from '@/types';
import { getFavorites, toggleFavorite } from '@/lib/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface FavoritesContextType {
  favoriteIds: Set<number>;
  toggleFavoriteStatus: (product: Product) => Promise<void>;
  isFavorite: (productId: number) => boolean;
  loading: boolean;
}

export const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites, FavoritesProvider içinde kullanılmalıdır.");
  }
  return context;
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
        const fetchFavorites = async () => {
            setLoading(true);
            const favoriteProducts = await getFavorites();
            setFavoriteIds(new Set(favoriteProducts.map(p => p.id)));
            setLoading(false);
        };
        fetchFavorites();
    } else {
        setFavoriteIds(new Set());
        setLoading(false);
    }
  }, [user]);

  const toggleFavoriteStatus = async (product: Product) => {
    const originalFavorites = new Set(favoriteIds);
    const isCurrentlyFavorite = originalFavorites.has(product.id);

    // 1. Anlık Geri Bildirim (Optimistic UI)
    // Önce state'i güncelle.
    setFavoriteIds(prev => {
        const newFavorites = new Set(prev);
        if (isCurrentlyFavorite) {
            newFavorites.delete(product.id);
        } else {
            newFavorites.add(product.id);
        }
        return newFavorites;
    });

    // DÜZELTME: Toast bildirimini state güncellemesinden SONRA çağır.
    if (isCurrentlyFavorite) {
        toast.success(`${product.name} favorilerden kaldırıldı.`);
    } else {
        toast.success(`${product.name} favorilere eklendi!`);
    }

    // 2. Arka planda API isteğini gönder
    const success = await toggleFavorite(product.id);

    // 3. Eğer API isteği başarısız olursa, değişikliği geri al
    if (!success) {
      setFavoriteIds(originalFavorites);
      toast.error("Bir hata oluştu, lütfen tekrar deneyin.");
    }
  };

  const isFavorite = (productId: number) => {
    return favoriteIds.has(productId);
  };

  return (
    <FavoritesContext.Provider value={{ favoriteIds, toggleFavoriteStatus, isFavorite, loading }}>
      {children}
    </FavoritesContext.Provider>
  );
}
