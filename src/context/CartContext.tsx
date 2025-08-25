//src/context/CartContext.tsx:

'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { CartDto } from '@/types';
// applyCoupon fonksiyonunu import et
import { addToCart, getCart, removeFromCart, applyCoupon } from '@/lib/api';

interface CartContextType {
  cart: CartDto | null;
  setCart: (cart: CartDto | null) => void;
  addItem: (productId: number) => Promise<void>;
  decreaseItem: (productId: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  // --- YENİ FONKSİYON TANIMI ---
  applyCouponCode: (couponCode: string) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart, CartProvider içinde kullanılmalıdır.");
  }
  return context;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartDto | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchCart() {
    setLoading(true);
    const fetchedCart = await getCart();
    setCart(fetchedCart);
    setLoading(false);
  }

  useEffect(() => {
    fetchCart();
  }, []);

  const addItem = async (productId: number) => {
    setLoading(true);
    const updatedCart = await addToCart(productId, 1);
    if (updatedCart) {
      setCart(updatedCart);
    }
    setLoading(false);
  };

  const decreaseItem = async (productId: number) => {
    setLoading(true);
    const updatedCart = await removeFromCart(productId, 1);
    setCart(updatedCart);
    setLoading(false);
  };

  const removeItem = async (productId: number) => {
    if (!cart) return;
    const item = cart.items.find(i => i.productId === productId);
    if (!item) return;
    setLoading(true);
    const updatedCart = await removeFromCart(productId, item.quantity);
    setCart(updatedCart);
    setLoading(false);
  };

  const refreshCart = async () => {
    await fetchCart();
  };

  // --- YENİ EKLENEN KUPON UYGULAMA FONKSİYONU ---
  const applyCouponCode = async (couponCode: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      const updatedCart = await applyCoupon(couponCode);
      if (updatedCart) {
        setCart(updatedCart);
        setLoading(false);
        return { success: true, message: 'Kupon başarıyla uygulandı!' };
      }
      setLoading(false);
      return { success: false, message: 'Kupon uygulanamadı.' };
    } catch (error: any) {
      setLoading(false);
      // API'den fırlatılan hata mesajını yakala
      return { success: false, message: error.message || 'Geçersiz kupon kodu.' };
    }
  };

  return (
    <CartContext.Provider value={{ cart, setCart, addItem, decreaseItem, removeItem, refreshCart, applyCouponCode, loading }}>
      {children}
    </CartContext.Provider>
  );
}
