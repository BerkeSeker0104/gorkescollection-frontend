"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { LayoutGrid, List } from "lucide-react";

export default function CategoryGridClient({ products }: { products: Product[] }) {
  const [mobileCols, setMobileCols] = useState<"1" | "2">("2");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("categoryMobileCols");
      if (saved === "1" || saved === "2") setMobileCols(saved);
    } catch {}
  }, []);

  const mobileClass = mobileCols === "1" ? "grid-cols-1" : "grid-cols-2";

  return (
    <>
      {/* Görünüm ikonları */}
      <div className="mb-4 sm:hidden flex justify-end gap-4">
        <button
          onClick={() => {
            setMobileCols("2");
            try { localStorage.setItem("categoryMobileCols", "2"); } catch {}
          }}
          className={`p-2 rounded ${mobileCols === "2" ? "bg-gray-200 text-teal-700" : "text-gray-500"}`}
        >
          <LayoutGrid size={22} />
        </button>
        <button
          onClick={() => {
            setMobileCols("1");
            try { localStorage.setItem("categoryMobileCols", "1"); } catch {}
          }}
          className={`p-2 rounded ${mobileCols === "1" ? "bg-gray-200 text-teal-700" : "text-gray-500"}`}
        >
          <List size={22} />
        </button>
      </div>

      {/* Ürün Grid */}
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