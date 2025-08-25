// Dosya: src/app/[slug]/page.tsx
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import CategoryGridClient from "@/components/CategoryGridClient";
import { getProductsPaged } from "@/lib/api";
import type { Category, Product } from "@/types";

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  // Next 14/15: searchParams Promise olabilir
  searchParams?: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const pageSize = 12; // ekranda 3x4 güzel görünüyor, istersen 16/24 yap

  const [categories, paged] = await Promise.all([
    getCategories(),
    getProductsPaged({ categorySlug: slug, page, pageSize, sortBy: "newest" }),
  ]);

  const currentCategory = categories.find((c) => c.slug === slug);
  const products: Product[] = paged.items ?? [];
  const total = Number(paged.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (!currentCategory) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Kategori Bulunamadı</h1>
          <p className="text-gray-600 mt-4">Aradığınız ‘{slug}’ kategorisi mevcut değil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white pt-32">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">{currentCategory.name}</h1>
          <p className="mt-4 text-lg text-gray-600">
            Koleksiyonumuzdaki en şık {currentCategory.name.toLowerCase()} ürünlerini keşfedin.
          </p>
        </div>

        {products.length > 0 ? (
          <>
            <CategoryGridClient products={products} />

            {totalPages > 1 && (
              <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Sayfalama">
                <PageLink href={`/${slug}?page=${page - 1}`} disabled={page <= 1}>
                  ‹ Önceki
                </PageLink>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const n = i + 1;
                  const active = n === page;
                  return active ? (
                    <span
                      key={n}
                      className="px-3 py-1.5 rounded border text-sm bg-gray-900 text-white border-gray-900 select-none"
                    >
                      {n}
                    </span>
                  ) : (
                    <Link
                      key={n}
                      href={`/${slug}?page=${n}`}
                      className="px-3 py-1.5 rounded border border-gray-200 text-sm bg-white text-gray-800 hover:bg-gray-100"
                    >
                      {n}
                    </Link>
                  );
                })}

                <PageLink href={`/${slug}?page=${page + 1}`} disabled={page >= totalPages}>
                  Sonraki ›
                </PageLink>
              </nav>
            )}
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

// küçük yardımcı: yeni-gelenler sayfasındaki ile aynı desen
function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="px-3 py-1.5 rounded border border-gray-200 text-sm text-gray-400 select-none">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded border border-gray-200 text-sm bg-white text-gray-800 hover:bg-gray-100"
    >
      {children}
    </Link>
  );
}