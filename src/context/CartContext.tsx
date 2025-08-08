'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { CartDto } from '@/types';
import { addToCart, getCart, removeFromCart } from '@/lib/api';

interface CartContextType {
  cart: CartDto | null;
  setCart: (cart: CartDto | null) => void;
  // Fonksiyon isimlerini daha anlaşılır hale getiriyoruz
  addItem: (productId: number) => Promise<void>;      // Miktarı 1 artırır
  decreaseItem: (productId: number) => Promise<void>; // Miktarı 1 azaltır
  removeItem: (productId: number) => Promise<void>;   // Ürünü tamamen kaldırır
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

  useEffect(() => {
    async function fetchCart() {
      const fetchedCart = await getCart();
      setCart(fetchedCart);
      setLoading(false);
    }
    fetchCart();
  }, []);

  // Miktarı 1 artırır (veya yeni ürün ekler)
  const addItem = async (productId: number) => {
    setLoading(true);
    const updatedCart = await addToCart(productId, 1);
    if (updatedCart) {
      setCart(updatedCart);
    }
    setLoading(false);
  };

  // Miktarı 1 azaltır
  const decreaseItem = async (productId: number) => {
    setLoading(true);
    const updatedCart = await removeFromCart(productId, 1);
    setCart(updatedCart);
    setLoading(false);
  };

  // Ürünü tamamen kaldırır
  const removeItem = async (productId: number) => {
    if (!cart) return;
    const item = cart.items.find(i => i.productId === productId);
    if (!item) return;

    setLoading(true);
    // Backend'deki RemoveItem metodu, miktar 0 veya daha az olunca ürünü siliyordu.
    // Bu yüzden mevcut miktarın tamamını gönderiyoruz.
    const updatedCart = await removeFromCart(productId, item.quantity);
    setCart(updatedCart);
    setLoading(false);
  };


  return (
    <CartContext.Provider value={{ cart, setCart, addItem, decreaseItem, removeItem, loading }}>
      {children}
    </CartContext.Provider>
  );
}
