// src/components/NewestGridPager.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getProductsPaged } from "@/lib/api";
import { Product } from "@/types";
import ProductCard from "./ProductCard";

type Props = {
  pageSize?: number; // varsayılan 8 (2x4)
  initialPage?: number;
};

export default function NewestGridPager({ pageSize = 8, initialPage = 1 }: Props) {
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const cacheRef = useRef<Map<number, Product[]>>(new Map());

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const load = async (p: number) => {
    // hafif cache
    if (cacheRef.current.has(p)) {
      setProducts(cacheRef.current.get(p)!);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { items, total } = await getProductsPaged({
      sortBy: "newest",
      page: p,
      pageSize,
    });
    cacheRef.current.set(p, items);
    setProducts(items);
    setTotalPages(Math.max(1, Math.ceil(total / pageSize)));
    setLoading(false);
  };

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  // Klavye ve teker desteği (desktop’ta rahat kullanım)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && canNext) setPage((x) => x + 1);
      if (e.key === "ArrowLeft" && canPrev) setPage((x) => x - 1);
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        if (e.deltaX > 0 && canNext) setPage((x) => x + 1);
        if (e.deltaX < 0 && canPrev) setPage((x) => x - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
    };
  }, [canNext, canPrev]);

  const grid = useMemo(() => {
    // 2 satır x 4 sütun (lg ve üstü), alt breakpointlerde responsive
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    );
  }, [products]);

  return (
    <div className="relative">
      {/* Sol/sağ oklar (desktop’ta rahat gezinme) */}
      <button
        type="button"
        aria-label="Önceki"
        onClick={() => canPrev && setPage((x) => x - 1)}
        disabled={!canPrev}
        className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full border bg-white/90 shadow disabled:opacity-40"
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Sonraki"
        onClick={() => canNext && setPage((x) => x + 1)}
        disabled={!canNext}
        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center rounded-full border bg-white/90 shadow disabled:opacity-40"
      >
        ›
      </button>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Yükleniyor…</div>
      ) : products.length === 0 ? (
        <div className="py-12 text-center text-gray-500">Yeni ürün yok.</div>
      ) : (
        grid
      )}

      {/* Sayfa numaraları (mobil + desktop) */}
      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Sayfalama">
          <PageBtn onClick={() => setPage((x) => Math.max(1, x - 1))} disabled={!canPrev}>
            ‹ Önceki
          </PageBtn>
          {Array.from({ length: totalPages }).map((_, i) => {
            const n = i + 1;
            const active = n === page;
            return (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={[
                  "px-3 py-1.5 rounded border text-sm",
                  active
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-800 border-gray-200 hover:bg-gray-100",
                ].join(" ")}
              >
                {n}
              </button>
            );
          })}
          <PageBtn onClick={() => setPage((x) => Math.min(totalPages, x + 1))} disabled={!canNext}>
            Sonraki ›
          </PageBtn>
        </nav>
      )}
    </div>
  );
}

function PageBtn({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1.5 rounded border border-gray-200 text-sm bg-white text-gray-800 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white"
    >
      {children}
    </button>
  );
}