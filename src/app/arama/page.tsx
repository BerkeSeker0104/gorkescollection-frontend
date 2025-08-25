// Dosya: src/app/arama/page.tsx (YENİ DOSYA)

import { searchProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";
  const products = await searchProducts(query);

  return (
    <div className="container mx-auto px-4 py-8 pt-32"> {/* pt-32 header boşluğu için */}
      <h1 className="text-3xl font-bold mb-2">Arama Sonuçları</h1>
      <p className="mb-8 text-gray-600">
        <span className="font-semibold">"{query}"</span> için bulunan sonuçlar:
      </p>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-gray-700">
            Maalesef aramanızla eşleşen bir ürün bulunamadı.
          </p>
          <p className="text-gray-500 mt-2">
            Farklı bir anahtar kelime ile tekrar deneyebilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
}