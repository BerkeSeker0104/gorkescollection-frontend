'use client';

import { useEffect, useState } from "react";
import { Product } from "@/types";
import { getProducts, deleteProduct } from "@/lib/api";
import Image from "next/image";
import { Edit, Trash2, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const fetchedProducts = await getProducts();
    setProducts(fetchedProducts);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId: number) => {
    if (window.confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
      const success = await deleteProduct(productId);
      if (success) {
        fetchProducts();
      } else {
        alert("Ürün silinirken bir hata oluştu.");
      }
    }
  };

  if (loading) return <p>Ürünler yükleniyor...</p>;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ürün Yönetimi</h1>
        <Link
          href="/admin/urunler/yeni"
          className="bg-gray-800 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-700"
        >
          <PlusCircle size={20} />
          Yeni Ürün Ekle
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
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
            {products.map((product) => {
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
                  <td className="p-4">{product.stockQuantity}</td>
                  <td className="p-4">
                    <div className="flex gap-4">
                      <Link
                        href={`/admin/urunler/duzenle/${product.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
