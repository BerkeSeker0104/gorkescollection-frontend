// src/context/CartContext.tsx

'use client';

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { CartDto } from '@/types';
import { addToCart, getCart, removeFromCart } from '@/lib/api';

// 1. Arayüze (interface) refreshCart eklendi
interface CartContextType {
  cart: CartDto | null;
  setCart: (cart: CartDto | null) => void;
  addItem: (productId: number) => Promise<void>;
  decreaseItem: (productId: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  refreshCart: () => Promise<void>; // Sepeti backend'den tazelemek için
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

  // 2. fetchCart fonksiyonu useEffect dışına taşındı
  //    Böylece hem başlangıçta hem de ihtiyaç anında çağırılabilir.
  async function fetchCart() {
    setLoading(true);
    const fetchedCart = await getCart();
    setCart(fetchedCart);
    setLoading(false);
  }

  useEffect(() => {
    // Component ilk yüklendiğinde sepeti bir kez çek
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
    const updatedCart = await removeFromCart(productId, item.quantity);
    setCart(updatedCart);
    setLoading(false);
  };

  // 3. Yeni refreshCart fonksiyonu tanımlandı
  const refreshCart = async () => {
    await fetchCart();
  };

  // 4. Provider'ın value prop'una refreshCart eklendi
  return (
    <CartContext.Provider value={{ cart, setCart, addItem, decreaseItem, removeItem, refreshCart, loading }}>
      {children}
    </CartContext.Provider>
  );
}