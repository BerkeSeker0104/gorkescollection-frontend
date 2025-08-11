"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

/** Mobilde tekli/ikili görünümü değiştirir; desktop düzeni sabit kalır */
export default function CategoryGridClient({ products }: { products: Product[] }) {
  // '1' = tekli, '2' = ikili (sadece <640px için anlamlı)
  const [mobileCols, setMobileCols] = useState<"1" | "2">("1");

  // localStorage'dan hatırla
  useEffect(() => {
    try {
      const saved = localStorage.getItem("categoryMobileCols");
      if (saved === "1" || saved === "2") setMobileCols(saved);
    } catch {}
  }, []);

  // Grid sınıfları:
  // - Mobilde toggle’a göre 1 veya 2 sütun
  // - sm: 2 sütun (tablet)
  // - lg: 3, xl: 4 sütun (desktop düzeni sabit)
  const mobileClass = mobileCols === "1" ? "grid-cols-1" : "grid-cols-2";

  return (
    <>
      {/* Mobil görünüm seçici */}
      <div className="mb-4 sm:hidden flex justify-end">
        <div className="inline-flex rounded-full border bg-white shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => {
              setMobileCols("1");
              try { localStorage.setItem("categoryMobileCols", "1"); } catch {}
            }}
            className={`px-3 py-1.5 text-sm font-medium ${mobileCols === "1" ? "bg-gray-900 text-white" : ""}`}
          >
            Tekli
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileCols("2");
              try { localStorage.setItem("categoryMobileCols", "2"); } catch {}
            }}
            className={`px-3 py-1.5 text-sm font-medium ${mobileCols === "2" ? "bg-gray-900 text-white" : ""}`}
          >
            İkili
          </button>
        </div>
      </div>

      <div
        className={[
          "grid gap-x-6 gap-y-10",
          mobileClass,
          "sm:grid-cols-2",
          "lg:grid-cols-3",
          "xl:grid-cols-4 xl:gap-x-8",
        ].join(" ")}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  );
}