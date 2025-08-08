import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/api";
import { Product } from "@/types";

export default async function NewArrivalsPage() {
  // Backend'den en yeni ürünleri çekiyoruz
  const products = await getProducts('newest');

  return (
    <div className="bg-white pt-40">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Yeni Gelenler</h1>
          <p className="mt-4 text-lg text-gray-600">
            Koleksiyonumuza en son eklenen şık ve modern tasarımlar.
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600">Yeni ürünler yakında eklenecektir.</p>
          </div>
        )}
      </div>
    </div>
  );
}
