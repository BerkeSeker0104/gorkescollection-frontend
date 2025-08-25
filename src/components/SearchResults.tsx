// Dosya: src/components/SearchResults.tsx (YENİ DOSYA)

import { searchProducts } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

interface SearchResultsProps {
  query: string;
}

export async function SearchResults({ query }: SearchResultsProps) {
  const products = await searchProducts(query);

  if (products.length > 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <p className="text-lg text-gray-700">
        Maalesef aramanızla eşleşen bir ürün bulunamadı.
      </p>
      <p className="text-gray-500 mt-2">
        Farklı bir anahtar kelime ile tekrar deneyebilirsiniz.
      </p>
    </div>
  );
}