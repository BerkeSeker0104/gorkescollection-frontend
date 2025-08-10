'use client';

import { useCart } from "@/context/CartContext";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface AddToCartButtonProps {
    productId: number;
}

export default function AddToCartButton({ productId }: AddToCartButtonProps) {
    const { addItem, loading } = useCart();

    const handleAddToCart = async () => {
        try {
            await addItem(productId);
            toast.success(
                <span>
                    Sepete eklendi.{" "}
                    <Link href="/sepet" className="underline font-medium">
                        Sepete git
                    </Link>
                </span>,
                { duration: 3000 }
            );
        } catch (error) {
            toast.error("Sepete eklenemedi.");
            console.error(error);
        }
    };

    return (
        <button
            onClick={handleAddToCart}
            disabled={loading}
            className="flex w-full max-w-xs items-center justify-center rounded-md border border-transparent bg-gray-900 px-8 py-3 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400"
        >
            {loading ? 'Ekleniyor...' : 'Sepete Ekle'}
        </button>
    );
}
