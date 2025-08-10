// Dosya: src/app/yeni-gelenler/page.tsx
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProductsPaged } from "@/lib/api";

export const metadata = {
  title: "Yeni Gelenler • Gorke's Collection",
  description: "Koleksiyona en son eklenen ürünler.",
};

// Next.js App Router: searchParams ile ?page=... yakalıyoruz
export default async function NewArrivalsPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const page = Math.max(1, Number(searchParams?.page ?? 1));
  const pageSize = 24;

  const { items: products, total } = await getProductsPaged({
    sortBy: "newest",
    page,
    pageSize,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="bg-white pt-40">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900">Yeni Gelenler</h1>
          <p className="mt-3 text-lg text-gray-600">
            Koleksiyonumuza en son eklenen şık ve modern tasarımlar.
          </p>
        </div>

        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {/* Sayfalama */}
            {totalPages > 1 && (
              <nav
                className="mt-10 flex items-center justify-center gap-2"
                aria-label="Sayfalama"
              >
                <PageLink href={`/yeni-gelenler?page=${page - 1}`} disabled={page <= 1}>
                  ‹ Önceki
                </PageLink>

                {/* Basit sayfa numaraları */}
                {Array.from({ length: totalPages }).map((_, i) => {
                  const n = i + 1;
                  const active = n === page;
                  return (
                    <Link
                      key={n}
                      href={`/yeni-gelenler?page=${n}`}
                      className={[
                        "px-3 py-1.5 rounded border text-sm",
                        active
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-800 border-gray-200 hover:bg-gray-100",
                      ].join(" ")}
                    >
                      {n}
                    </Link>
                  );
                })}

                <PageLink href={`/yeni-gelenler?page=${page + 1}`} disabled={page >= totalPages}>
                  Sonraki ›
                </PageLink>
              </nav>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-600">Yeni ürünler yakında eklenecektir.</p>
          </div>
        )}
      </div>
    </div>
  );
}

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