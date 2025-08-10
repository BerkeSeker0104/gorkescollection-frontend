// src/components/ProductMarquee.tsx
'use client';

import { Product } from '@/types';
import ProductCard from './ProductCard';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback } from 'react';

interface ProductMarqueeProps {
  products: Product[];
}

export default function ProductMarquee({ products }: ProductMarqueeProps) {
  if (!products || products.length === 0) return null;

  // loop + autoplay; hover’da durur, etkileşimde durur, sonra devam eder
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', dragFree: true, skipSnaps: false },
    [Autoplay({ delay: 3000, stopOnMouseEnter: true, stopOnInteraction: true })]
  );

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative">
      {/* Viewport */}
      <div className="overflow-hidden" ref={emblaRef}>
        {/* Container */}
        <div className="flex gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              // her slide genişliği: mobil ~260px, md ~300px, lg ~340px
              className="min-w-[260px] md:min-w-[300px] lg:min-w-[340px] flex-[0_0_auto]"
            >
              <div className="transition-transform duration-300 hover:scale-[1.02]">
                <ProductCard product={p} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Oklar (desktop’ta göster) */}
      <button
        onClick={prev}
        aria-label="Geri"
        className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 shadow p-2 hover:bg-white"
      >
        <svg width="22" height="22" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </button>
      <button
        onClick={next}
        aria-label="İleri"
        className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 shadow p-2 hover:bg-white"
      >
        <svg width="22" height="22" viewBox="0 0 24 24">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </button>
    </div>
  );
}
