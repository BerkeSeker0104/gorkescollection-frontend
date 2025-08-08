'use client';

import { Product } from "@/types";
import ProductCard from "./ProductCard";

interface ProductMarqueeProps {
    products: Product[];
}

export default function ProductMarquee({ products }: ProductMarqueeProps) {
    if (!products || products.length === 0) {
        return null;
    }

    // Sorunsuz bir döngü için ürün listesini iki kez kullanıyoruz
    const extendedProducts = [...products, ...products];

    return (
        <div className="w-full overflow-hidden group-hover:pause-animation">
            <div className="flex animate-scroll-x">
                {extendedProducts.map((product, index) => (
                    <div key={`${product.id}-${index}`} className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4">
                        <div className="transition-transform duration-300 hover:!scale-105">
                           <ProductCard product={product} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
