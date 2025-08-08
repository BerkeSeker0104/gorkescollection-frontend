'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types';
import { getFavorites } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function FavoritesPage() {
    const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            const fetchFavorites = async () => {
                setLoading(true);
                const products = await getFavorites();
                setFavoriteProducts(products);
                setLoading(false);
            };
            fetchFavorites();
        } else {
            setLoading(false);
        }
    }, [user]);

    if (loading) {
        return <div className="text-center pt-48">Favoriler yükleniyor...</div>;
    }

    if (!user) {
        return (
            <div className="text-center pt-48">
                <h1 className="text-2xl font-bold">Favorilerinizi Görmek İçin Giriş Yapın</h1>
                <Link href="/giris" className="mt-4 inline-block bg-gray-800 text-white px-6 py-2 rounded-md">
                    Giriş Yap
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white pt-40">
            <div className="container mx-auto px-6 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900">Favorilerim</h1>
                    <p className="mt-4 text-lg text-gray-600">Beğendiğiniz ve daha sonra incelemek için kaydettiğiniz ürünler.</p>
                </div>

                {favoriteProducts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                        {favoriteProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-gray-600">Henüz favorilerinize bir ürün eklemediniz.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
