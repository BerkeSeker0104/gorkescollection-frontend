import ProductCard from "@/components/ProductCard";
import CategoryGridClient from "@/components/CategoryGridClient";
import { Category, Product } from "@/types";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

async function getProductsByCategory(slug: string): Promise<Product[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/products?categorySlug=${encodeURIComponent(slug)}`,
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
      cache: "no-store",
    });
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">{currentCategory.name}</h1>
          <p className="mt-4 text-lg text-gray-600">
            Koleksiyonumuzdaki en şık {currentCategory.name.toLowerCase()} ürünlerini keşfedin.
          </p>
        </div>

        {products.length > 0 ? (
          <CategoryGridClient products={products} />
        ) : (
          <div className="text-center">
            <p className="text-gray-600">Bu kategoride henüz ürün bulunmamaktadır.</p>
          </div>
        )}
      </div>
    </div>
  );
}