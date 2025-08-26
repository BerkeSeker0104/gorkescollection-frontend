'use client';

import { Product } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { toast } from 'react-hot-toast';
import FavoriteButton from './FavoriteButton';

interface ProductCardProps {
  product: Product;
}

const formatTRY = (n: number) =>
  n.toLocaleString('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  
  const isInStock = product.stockQuantity > 0;

  const base =
    typeof product.priceOriginal === 'number' && product.priceOriginal > 0
      ? product.priceOriginal
      : (typeof product.price === 'number' ? product.price : 0);

  const final =
    product.isOnSaleNow &&
    typeof product.priceFinal === 'number' &&
    product.priceFinal > 0
      ? product.priceFinal
      : base;
  const hasDiscount = Boolean(product.isOnSaleNow && final < base);

  const thumb =
    (product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : null) ||
    `https://placehold.co/400x400/F7F5F2/333333.png?text=${encodeURIComponent(
      product.name
    )}`;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isInStock) {
        toast.error('Bu ürün şu anda stokta bulunmamaktadır.');
        return;
    }

    try {
      await Promise.resolve(addItem(product.id));
      toast.success(
        <span>
          Sepete eklendi.{' '}
          <Link href="/sepet" className="underline font-medium">
            Sepete git
          </Link>
        </span>,
        { duration: 3000 }
      );
    } catch (err: any) {
      toast.error(err?.message || 'Sepete eklenemedi');
    }
  };

  return (
    <div className="group relative flex flex-col">
      <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-200 relative">
        <Image
          src={thumb}
          alt={product.name}
          width={400}
          height={400}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />

        {hasDiscount && (
          <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            {typeof product.discountPercent === 'number'
              ? `-%${Math.round(product.discountPercent)}`
              : product.saleLabel || 'İndirim'}
          </div>
        )}

        <div className="absolute top-3 right-3 z-20">
            <FavoriteButton
                product={product}
                className="bg-white/70 backdrop-blur-sm lg:opacity-0 group-hover:opacity-100"
            />
        </div>

        {/* MASAÜSTÜ İÇİN SEPETE EKLE (Hover üzerinde belirir) */}
        {isInStock && (
            <button
              onClick={handleAddToCart}
              className="hidden md:flex absolute left-3 right-3 bottom-3 items-center justify-center gap-2 rounded-md bg-gray-900/90 text-white py-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-20"
              aria-label="Sepete ekle"
            >
              <ShoppingBag size={18} />
              <span className="text-sm font-medium">Sepete Ekle</span>
            </button>
        )}
        
        {/* MASAÜSTÜ İÇİN TÜKENDİ (Hover üzerinde belirir) */}
        {!isInStock && (
            <div className="hidden md:flex absolute left-3 right-3 bottom-3 items-center justify-center gap-2 rounded-md bg-gray-400/80 text-white py-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-20 cursor-not-allowed">
              <span className="text-sm font-medium">Tükendi</span>
            </div>
        )}
      </div>

      <div className="mt-4 flex flex-col flex-grow">
        <h3 className="text-sm text-gray-700 line-clamp-1">
          <Link href={`/urun/${product.id}`}>
            <span aria-hidden="true" className="absolute inset-0 z-0" />
            {product.name}
          </Link>
        </h3>

        {hasDiscount ? (
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm text-gray-500 line-through">{formatTRY(base)}</span>
            <span className="text-sm font-semibold text-gray-900">{formatTRY(final)}</span>
          </div>
        ) : (
          <p className="text-sm font-medium text-gray-900 mt-1">{formatTRY(base)}</p>
        )}

        {/* ======================= MOBİL İÇİN YENİ BUTON ALANI ======================= */}
        <div className="mt-auto pt-3 md:hidden">
            {isInStock ? (
                <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-2 rounded-md bg-gray-900 text-white py-2 transition-colors shadow-sm"
                    aria-label="Sepete ekle"
                >
                    <ShoppingBag size={18} />
                    <span className="text-sm font-medium">Sepete Ekle</span>
                </button>
            ) : (
                <div className="w-full text-center rounded-md bg-gray-200 text-gray-500 py-2 text-sm font-medium cursor-not-allowed">
                    Tükendi
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;