'use client';

import { useCart } from "@/context/CartContext";
import { useState } from "react";

interface AddToCartButtonProps {
    productId: number;
}

export default function AddToCartButton({ productId }: AddToCartButtonProps) {
    const { addItem, loading } = useCart();
    const [quantity, setQuantity] = useState(1); // Şimdilik miktar hep 1

    const handleAddToCart = async () => {
        await addItem(productId, quantity);
        // TODO: Sepete eklendiğine dair bir bildirim gösterilebilir.
        console.log(`${productId} ID'li ürün sepete eklendi.`);
    };

    return (
        <button
            onClick={handleAddToCart}
            disabled={loading} // Yükleme sırasında butonu pasif yap
            className="flex w-full max-w-xs items-center justify-center rounded-md border border-transparent bg-gray-900 px-8 py-3 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400"
        >
            {loading ? 'Ekleniyor...' : 'Sepete Ekle'}
        </button>
    );
}
