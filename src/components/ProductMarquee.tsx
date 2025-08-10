// src/components/ProductMarquee.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Product } from "@/types";
import ProductCard from "./ProductCard";

type Props = { products: Product[] };

/**
 * Sonsuz akan, hover/drag/tekerlek ile durup kontrol edilebilen ürün şeridi.
 * - Auto flow (yavaş)
 * - Drag (mobil & desktop), momentum/atalet
 * - Trackpad/mouse wheel ile yatay kaydırma
 */
export default function ProductMarquee({ products }: Props) {
  const base = useMemo(() => products ?? [], [products]);
  if (!base.length) return null;

  // Sonsuzluk için 2× kopya
  const items = useMemo(() => [...base, ...base], [base]);

  // --- refs & state ---
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [disableClicks, setDisableClicks] = useState(false);

  const posRef = useRef(0);          // px: sola kayma
  const widthRef = useRef(0);        // tek tur genişliği
  const vxRef = useRef(0);           // momentum hızı (px/sn)
  const wheelTimerRef = useRef<number | null>(null);
  const pointerXRef = useRef<number | null>(null);

  // === AYARLAR ===
  const SPEED = 55;        // otomatik akış hızı (px/sn) — daha yavaş
  const FRICTION = 0.92;   // momentum sürtünmesi (0.9-0.96 arası iyi)
  const WHEEL_PAUSE_MS = 500; // wheel sonrası akışa dönme gecikmesi

  // İçerik genişliğini ölç
  useEffect(() => {
    const measure = () => {
      const el = trackRef.current;
      if (!el) return;
      widthRef.current = el.scrollWidth / 2; // 2× olduğu için yarısı tek tur
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
    setDragging(true);
    setPaused(true);
    setDisableClicks(true); // drag sırasında yanlışlıkla tıklamayı engelle
    pointerXRef.current = e.clientX;
    vxRef.current = 0; // momentum sıfırla
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || pointerXRef.current == null) return;
    const dx = e.clientX - pointerXRef.current;
    pointerXRef.current = e.clientX;

    // sürüklerken pos'u güncelle, momentum için hız tahmini
    posRef.current -= dx;
    // basit hız tahmini (px/sn): dx / dt yerine sabit katsayıyla
    vxRef.current = -dx * 12; // katsayı sürükleme hissini ayarlar

    const W = widthRef.current || 1;
    while (posRef.current < 0) posRef.current += W;
    while (posRef.current > W) posRef.current -= W;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    // Momentum yavaşlayana kadar paused=true kalsın, sonra otomatik akış devreye girer
    const backToAuto = window.setTimeout(() => setPaused(false), 900);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

    // bir sonraki frame'de click tekrar aktif olsun (buton/link tıklaması kaçmasın)
    window.setTimeout(() => setDisableClicks(false), 0);
  };

  // --- wheel/trackpad yatay kaydırma ---
  const onWheel = (e: React.WheelEvent) => {
    // deltaX varsa onu, yoksa shift+deltaY'yi kullan
    const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
    if (!dx) return;

    e.preventDefault();
    setPaused(true);
    posRef.current += dx; // doğal yön: sağı göster
    vxRef.current = dx * 3; // ufak momentum

    const W = widthRef.current || 1;
    while (posRef.current < 0) posRef.current += W;
    while (posRef.current > W) posRef.current -= W;

    if (wheelTimerRef.current) window.clearTimeout(wheelTimerRef.current);
    wheelTimerRef.current = window.setTimeout(() => setPaused(false), WHEEL_PAUSE_MS);
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      // wheel ile yatay kaydırma
      onWheel={onWheel}
      // Kaydırma ergonomisi
      style={{
        touchAction: "pan-x",
        overscrollBehavior: "contain",
        cursor: dragging ? "grabbing" : "grab",
      }}
    >
      <div
        ref={trackRef}
        className={`flex gap-5 will-change-transform select-none ${disableClicks ? "pointer-events-none" : ""}`}
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