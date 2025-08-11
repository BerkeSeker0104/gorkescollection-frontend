// src/app/[slug]/page.tsx
import ProductCard from "@/components/ProductCard";
import { Category, Product } from "@/types";

/** Next.js 15: params artık Promise dönüyor */
interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

async function getProductsByCategory(slug: string): Promise<Product[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products?categorySlug=${encodeURIComponent(
        slug
      )}`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data as Product[];
    if (data && Array.isArray(data.items)) return data.items as Product[];
    return [];
  } catch {
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/categories`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const [products, categories] = await Promise.all([
    getProductsByCategory(slug),
    getCategories(),
  ]);

  const normalizedSlug = slug.toLowerCase();
  const currentCategory = categories.find(
    (cat) => cat.slug.toLowerCase() === normalizedSlug
  );

  if (!currentCategory) {
    return (
      <div className="container mx-auto px-6 py-16 text-center pt-48">
        <h1 className="text-3xl font-bold text-gray-800">Kategori Bulunamadı</h1>
        <p className="text-gray-600 mt-4">
          Aradığınız '{slug}' kategorisi mevcut değil.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white pt-32">
      <div className="container mx-auto px-6 py-16">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-center w-full">
            <h1 className="text-4xl font-bold text-gray-900">
              {currentCategory.name}
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Koleksiyonumuzdaki en şık {currentCategory.name.toLowerCase()} ürünlerini
              keşfedin.
            </p>
          </div>
        </div>

        {products.length > 0 ? (
          <>
            {/* Mobil görünüm seçici */}
            <div className="mb-4 sm:hidden flex justify-end">
              <MobileViewToggle />
            </div>

            {/* Ürün grid’i (mobil görünüm seçimine duyarlı) */}
            <CategoryGridClient products={products} />
          </>
        ) : (
          <div className="text-center">
            <p className="text-gray-600">Bu kategoride henüz ürün bulunmamaktadır.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------- */
/* Client alt bileşenleri  */
/* ----------------------- */

function MobileViewToggle() {
  return (
    <div
      id="mobile-view-toggle"
      className="inline-flex rounded-full border bg-white shadow-sm overflow-hidden"
    >
      <button
        type="button"
        data-view="1"
        className="px-3 py-1.5 text-sm font-medium aria-selected:bg-gray-900 aria-selected:text-white"
        aria-selected="true"
      >
        Tekli
      </button>
      <button
        type="button"
        data-view="2"
        className="px-3 py-1.5 text-sm font-medium aria-selected:bg-gray-900 aria-selected:text-white"
        aria-selected="false"
      >
        İkili
      </button>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";

/** Mobilde tekli/ikili görünümü değiştirir; desktop düzeni sabit kalır */
function CategoryGridClient({ products }: { products: Product[] }) {
  // '1' = tekli, '2' = ikili (sadece <640px için anlamlı)
  const [mobileCols, setMobileCols] = useState<"1" | "2">("1");

  // localStorage'dan hatırla
  useEffect(() => {
    try {
      const saved = localStorage.getItem("categoryMobileCols");
      if (saved === "1" || saved === "2") setMobileCols(saved);
    } catch {}
  }, []);

  // Toggle butonlarını kabaca bağla (küçük ve bağımsız kaldı)
  useEffect(() => {
    const root = document.getElementById("mobile-view-toggle");
    if (!root) return;

    const buttons = Array.from(
      root.querySelectorAll<HTMLButtonElement>("button[data-view]")
    );

    const updateAria = (val: "1" | "2") => {
      buttons.forEach((b) => {
        const v = (b.getAttribute("data-view") as "1" | "2") ?? "1";
        b.setAttribute("aria-selected", v === val ? "true" : "false");
      });
    };

    const onClick = (e: Event) => {
      const target = e.currentTarget as HTMLButtonElement;
      const val = (target.getAttribute("data-view") as "1" | "2") ?? "1";
      setMobileCols(val);
      try {
        localStorage.setItem("categoryMobileCols", val);
      } catch {}
      updateAria(val);
    };

    buttons.forEach((b) => b.addEventListener("click", onClick));
    updateAria(mobileCols);

    return () => buttons.forEach((b) => b.removeEventListener("click", onClick));
  }, [mobileCols]);

  // Grid sınıfları:
  // - Mobilde toggle’a göre 1 veya 2 sütun
  // - sm: 2 sütun (tablet)
  // - lg: 3, xl: 4 sütun (desktop düzeni sabit)
  const mobileClass =
    mobileCols === "1" ? "grid-cols-1" : "grid-cols-2";

  return (
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
  );
}