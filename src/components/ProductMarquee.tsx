// src/components/ProductMarquee.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Product } from "@/types";
import ProductCard from "./ProductCard";

type Props = { products: Product[] };

/**
 * Sonsuz akan, hover/drag ile duran ve kullanıcının manuel kaydırabildiği ürün şeridi.
 */
export default function ProductMarquee({ products }: Props) {
  const base = useMemo(() => products ?? [], [products]);
  if (!base.length) return null;

  // Sonsuzluk için içerik 2×
  const items = useMemo(() => [...base, ...base], [base]);

  // --- refs & state ---
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const posRef = useRef(0); // px cinsinden sol kayma
  const widthRef = useRef(0); // tek döngü genişliği (px)
  const pointerXRef = useRef<number | null>(null);

  // Akış hızı (px/sn). İstersen değiştir: 80–140 arası iyi durur
  const SPEED = 110;

  // İçerik genişliğini ölç
  useEffect(() => {
    const measure = () => {
      const el = trackRef.current;
      if (!el) return;
      // İçerik 2× olduğu için yarısı tek tur genişliği
      widthRef.current = el.scrollWidth / 2;
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [items.length]);

  // RAF ile akışı sürdür
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = (now - last) / 1000; // saniye
      last = now;

      if (!paused && !dragging) {
        posRef.current += SPEED * dt;
        const W = widthRef.current || 1;
        // Sonsuz döngü için mod
        if (posRef.current > W) posRef.current -= W;
      }

      const el = trackRef.current;
      if (el) {
        el.style.transform = `translateX(${-posRef.current}px)`;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, dragging]);

  // --- pointer (drag) kontrolü ---
  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    setPaused(true);
    pointerXRef.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || pointerXRef.current == null) return;
    const dx = e.clientX - pointerXRef.current;
    pointerXRef.current = e.clientX;

    // Sağa sürükleme -> pos azalır (şerit sağa gider)
    posRef.current -= dx;
    const W = widthRef.current || 1;
    // Mod aralığında tut
    while (posRef.current < 0) posRef.current += W;
    while (posRef.current > W) posRef.current -= W;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    setPaused(false);
    pointerXRef.current = null;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className="flex gap-6 will-change-transform select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {items.map((p, i) => (
          <div
            key={`${p.id}-${i}`}
            className="
              flex-[0_0_70%]
              sm:flex-[0_0_45%]
              md:flex-[0_0_28%]
              lg:flex-[0_0_22%]
              xl:flex-[0_0_18%]
            "
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* küçük ipucu: sürüklenebilirlik */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-6 text-center text-xs text-gray-400">
        Sürükleyerek kaydırabilirsiniz
      </div>
    </div>
  );
}