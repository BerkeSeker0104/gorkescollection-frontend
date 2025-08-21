// src/components/ProductMarquee.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Product } from "@/types";
import ProductCard from "./ProductCard";

type Props = { products: Product[] };

export default function ProductMarquee({ products }: Props) {
  const base = useMemo(() => products ?? [], [products]);
  if (!base.length) return null;

  // Sonsuzluk için 2× kopya
  const items = useMemo(() => [...base, ...base], [base]);

  // --- refs & state ---
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);

  // drag eşiği için
  const startXRef = useRef<number | null>(null);
  const lastXRef = useRef<number | null>(null);
  const didMovePastThresholdRef = useRef(false);

  // akış/momentum
  const posRef = useRef(0);
  const widthRef = useRef(0);
  const vxRef = useRef(0);
  const wheelTimerRef = useRef<number | null>(null);

  // === AYARLAR ===
  const SPEED = 55;         // px/sn
  const FRICTION = 0.92;    // 0.9-0.96 iyi
  const WHEEL_PAUSE_MS = 500;
  const DRAG_THRESHOLD = 6; // px — bundan küçükse tıklama say

  // İçerik genişliği ölç
  useEffect(() => {
    const measure = () => {
      const el = trackRef.current;
      if (!el) return;
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

  // RAF döngüsü
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      // momentum
      if (Math.abs(vxRef.current) > 0.1) {
        posRef.current += vxRef.current * dt;
        vxRef.current *= FRICTION;
      } else if (!paused && !dragging) {
        // otomatik akış
        posRef.current += SPEED * dt;
      }

      // mod aralığı
      const W = widthRef.current || 1;
      while (posRef.current < 0) posRef.current += W;
      while (posRef.current > W) posRef.current -= W;

      const el = trackRef.current;
      if (el) el.style.transform = `translateX(${-posRef.current}px)`;

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, dragging]);

  // --- pointer (drag) kontrolü ---
  const onPointerDown = (e: React.PointerEvent) => {
    setPaused(true);
    setDragging(false);
    didMovePastThresholdRef.current = false;

    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    // *** ÖNEMLİ: Burada pointer capture ALMIYORUZ. ***
    // Sadece eşik aşıldığında alacağız.
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (startXRef.current == null) return;

    const x = e.clientX;
    const lastX = lastXRef.current ?? x;
    const dxRaw = x - lastX;
    lastXRef.current = x;

    // eşik kontrolü (mutlak toplam hareket)
    if (!didMovePastThresholdRef.current) {
      const total = Math.abs((x - startXRef.current) || 0);
      if (total > DRAG_THRESHOLD) {
        didMovePastThresholdRef.current = true;
        setDragging(true);
        // *** Eşik aşıldı -> Artık pointer capture alabiliriz. ***
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } else {
        return; // henüz drag değil; tıklama gibi davransın
      }
    }

    // DRAG modundayız
    const dx = dxRaw;
    // sürüklerken pos'u güncelle, momentum için hız tahmini
    posRef.current -= dx;
    vxRef.current = -dx * 12;

    const W = widthRef.current || 1;
    while (posRef.current < 0) posRef.current += W;
    while (posRef.current > W) posRef.current -= W;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    // Eğer drag olduysa, momentum yavaşlayana kadar paused=true kalsın
    if (dragging) {
      window.setTimeout(() => setPaused(false), 900);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    } else {
      // Drag olmadı: bu bir tıklamaydı -> hemen auto flow'a dön
      setPaused(false);
    }

    // reset
    setDragging(false);
    startXRef.current = null;
    lastXRef.current = null;
    didMovePastThresholdRef.current = false;
  };

  // --- wheel/trackpad yatay kaydırma ---
  const onWheel = (e: React.WheelEvent) => {
    // deltaX varsa onu, yoksa shift+deltaY'yi kullan
    const dx =
      Math.abs(e.deltaX) > Math.abs(e.deltaY)
        ? e.deltaX
        : e.shiftKey
        ? e.deltaY
        : 0;
    if (!dx) return;

    e.preventDefault();
    setPaused(true);
    posRef.current += dx;
    vxRef.current = dx * 3;

    const W = widthRef.current || 1;
    while (posRef.current < 0) posRef.current += W;
    while (posRef.current > W) posRef.current -= W;

    if (wheelTimerRef.current) window.clearTimeout(wheelTimerRef.current);
    wheelTimerRef.current = window.setTimeout(
      () => setPaused(false),
      WHEEL_PAUSE_MS
    );
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onWheel={onWheel}
      // Kaydırma ergonomisi
      style={{
        touchAction: "pan-x",
        overscrollBehavior: "contain",
        cursor: dragging ? "grabbing" : "grab",
      }}
      // *** Drag halinde tıklamayı iptal et: link ve butonlar yanlışlıkla tetiklenmesin ***
      onClickCapture={(e) => {
        if (dragging) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <div
        ref={trackRef}
        className="flex gap-5 will-change-transform select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {items.map((p, i) => (
          <div
            key={`${p.id}-${i}`}
            className="
              flex-[0_0_78%]
              xs:flex-[0_0_68%]
              sm:flex-[0_0_44%]
              md:flex-[0_0_28%]
              lg:flex-[0_0_22%]
              xl:flex-[0_0_18%]
            "
          >
            {/* ProductCard içindeki Link/Butonlar artık normal şekilde tıklanabilir */}
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* ipucu */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-6 text-center text-xs text-gray-400">
        Parmağınızla ya da fareyle sürükleyin • Trackpad ile kaydırın
      </div>
    </div>
  );
}