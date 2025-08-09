'use client';

import { useEffect, useMemo, useState } from "react";
import { Product, Category } from "@/types";
import { getProducts, deleteProduct, getCategories } from "@/lib/api";
import Image from "next/image";
import { Edit, Trash2, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "ALL">("ALL");

  const fetchAll = async () => {
    setLoading(true);
    const [fetchedProducts, fetchedCategories] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);
    setProducts(fetchedProducts);
    setCategories(fetchedCategories);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const getProductCategoryId = (p: Product): number | null => {
    // p.categoryId || p.category?.id destekle
    const flat = (p as unknown as { categoryId?: number })?.categoryId;
    const rel = (p as unknown as { category?: { id?: number } })?.category?.id;
    return typeof flat === "number" ? flat : (typeof rel === "number" ? rel : null);
  };

  const getCategoryName = (id: number | null): string => {
    if (id == null) return "Diğer";
    return categories.find(c => c.id === id)?.name ?? "Diğer";
    };

  // Filtre + kategori adına göre sıralama + gruplama
  const grouped = useMemo(() => {
    // Filtre uygula
    const filtered = selectedCategoryId === "ALL"
      ? products
      : products.filter(p => getProductCategoryId(p) === selectedCategoryId);

    // Kategori adına göre sırala (aynı kategoride ürün adına göre)
    const sorted = [...filtered].sort((a, b) => {
      const aCat = getCategoryName(getProductCategoryId(a));
      const bCat = getCategoryName(getProductCategoryId(b));
      if (aCat !== bCat) return aCat.localeCompare(bCat, "tr");
      return (a.name || "").localeCompare(b.name || "", "tr");
    });

    // Gruplara ayır
    const map = new Map<string, Product[]>();
    for (const p of sorted) {
      const key = getCategoryName(getProductCategoryId(p));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return map;
  }, [products, categories, selectedCategoryId]);

  const handleDelete = async (productId: number) => {
    if (window.confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
      const success = await deleteProduct(productId);
      if (success) {
        fetchAll();
      } else {
        alert("Ürün silinirken bir hata oluştu.");
      }
    }
  };

  if (loading) return <p>Ürünler yükleniyor...</p>;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ürün Yönetimi</h1>

        {/* Kategori filtresi + Yeni Ürün */}
        <div className="flex gap-3 items-center">
          <select
            value={selectedCategoryId}
            onChange={(e) =>
              setSelectedCategoryId(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
            }
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="ALL">Tümü (kategori)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <Link
            href="/admin/urunler/yeni"
            className="bg-gray-800 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-700"
          >
            <PlusCircle size={20} />
            Yeni Ürün Ekle
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead>
            <tr className="border-b">
              <th className="p-4">Görsel</th>
              <th className="p-4">Ürün Adı</th>
              <th className="p-4">Fiyat</th>
              <th className="p-4">Stok</th>
              <th className="p-4">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {[...grouped.entries()].map(([catName, list]) => (
              <Fragment key={catName}>
                {/* Grup başlığı */}
                <tr className="bg-gray-50/60">
                  <td className="p-3 font-semibold text-gray-700" colSpan={5}>
                    {catName}
                    <span className="ml-2 text-xs text-gray-500">({list.length})</span>
                  </td>
                </tr>

                {/* Grup ürünleri */}
                {list.map((product) => {
                  const thumb =
                    product.imageUrls?.[0] ||
                    `https://placehold.co/100x100/F7F5F2/333333.png?text=${encodeURIComponent(
                      product.name
                    )}`;

                  return (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <Image
                          src={thumb}
                          alt={product.name}
                          width={50}
                          height={50}
                          className="rounded-md object-cover"
                        />
                      </td>
                      <td className="p-4 font-medium">{product.name}</td>
                      <td className="p-4">
                        {Number(product.price).toLocaleString("tr-TR", {
                          style: "currency",
                          currency: "TRY",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-4">{(product as any).stockQuantity}</td>
                      <td className="p-4">
                        <div className="flex gap-4">
                          <Link
                            href={`/admin/urunler/duzenle/${product.id}`}
                            className="text-blue-600 hover:text-blue-800"
                            title="Düzenle"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Sil"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// küçük yardımcı: Fragment importu
import { Fragment } from "react";
