"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { getProductsPaged } from "@/lib/api";
import type { Product } from "@/types";

function useResponsivePageSize() {
  const [pageSize, setPageSize] = useState<number | null>(null); // Başlangıçta null

  useEffect(() => {
    const calc = () => (window.innerWidth >= 1024 ? 8 : 4); // lg breakpoint
    const apply = () => setPageSize(calc());

    apply();

    let t: any;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(apply, 120);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return pageSize;
}

export default function NewestGridPager() {
  const pageSize = useResponsivePageSize();

  const [page, setPage] = useState<number>(1);
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / Math.max(1, pageSize || 1))),
    [total, pageSize]
  );

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const load = useCallback(async () => {
    if (pageSize === null) return; // henüz belirlenmedi
    setLoading(true);
    try {
      const res = await getProductsPaged({
        sortBy: "newest",
        page,
        pageSize,
      });
      setItems(res.items || []);
      setTotal(res.total || 0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    if (pageSize !== null) {
      load();
    }
  }, [load, pageSize]);

  const prev = () => setPage((p) => Math.max(1, p - 1));
  const next = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <section className="relative container mx-auto px-6 pb-24">
      {/* Oklar */}
      <button
        type="button"
        onClick={prev}
        disabled={loading || page <= 1}
        aria-label="Önceki"
        className={[
          "hidden sm:flex",
          "items-center justify-center",
          "absolute left-2 top-1/2 -translate-y-1/2 z-20",
          "h-10 w-10 rounded-full border bg-white/95 shadow",
          "hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed",
        ].join(" ")}
      >
        ‹
      </button>

      <button
        type="button"
        onClick={next}
        disabled={loading || page >= totalPages}
        aria-label="Sonraki"
        className={[
          "hidden sm:flex",
          "items-center justify-center",
          "absolute right-2 top-1/2 -translate-y-1/2 z-20",
          "h-10 w-10 rounded-full border bg-white/95 shadow",
          "hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed",
        ].join(" ")}
      >
        ›
      </button>

      {/* Grid */}
      {loading ? (
        <div className="py-12 text-center text-gray-500">Yükleniyor…</div>
      ) : items.length > 0 ? (
        <>
          <div
            className="
              grid gap-6
              grid-cols-2
              lg:grid-cols-4
            "
          >
            {items.map((p) => (
              <div key={p.id} className="w-full">
                <ProductCard product={p} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm">
              <button
                onClick={prev}
                disabled={page <= 1 || loading}
                className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50 disabled:opacity-40"
              >
                ‹ Önceki
              </button>
              <span className="px-2 text-gray-600">
                Sayfa {page} / {totalPages}
              </span>
              <button
                onClick={next}
                disabled={page >= totalPages || loading}
                className="px-3 py-1.5 rounded border bg-white hover:bg-gray-50 disabled:opacity-40"
              >
                Sonraki ›
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-12 text-center text-gray-500">
          Yeni ürünler yakında eklenecektir.
        </div>
      )}
    </section>
  );
}