"use client";

import ProductForm, { ProductFormData } from "@/components/ProductForm";
import { createProduct, getCategories } from "@/lib/api";
import { AdminProductDto, Category } from "@/types";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // useRouter'ı import edelim

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // router'ı tanımlayalım

  useEffect(() => {
    const fetchCategories = async () => {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
      setLoading(false);
    };
    fetchCategories();
  }, []);

  const handleCreateProduct = async (data: ProductFormData) => {
    const specsAsObject = (data.specifications || []).reduce((obj, item) => {
      if (item.key.trim() && item.value.trim()) {
        obj[item.key] = item.value;
      }
      return obj;
    }, {} as Record<string, string>);

    // GÜNCELLENDİ: Eksik alanlar eklendi
    const finalData: AdminProductDto = {
      // YENİ EKLENEN ALANLAR
      sku: data.sku,
      displayOrder: data.displayOrder,

      // Mevcut alanlar
      name: data.name,
      description: data.description,
      price: data.price,
      stockQuantity: data.stockQuantity,
      categoryId: data.categoryId,
      imageUrls: data.imageUrls,
      specifications: specsAsObject,
      isFeatured: data.isFeatured,

      // YENİ EKLENEN İNDİRİM ALANLARI
      saleType: data.saleType,
      saleValue: data.saleValue,
      saleStartUtc: data.saleStartUtc,
      saleEndUtc: data.saleEndUtc,
      saleLabel: data.saleLabel,
    };

    const newProduct = await createProduct(finalData);
    
    if (newProduct) {
      alert("Ürün başarıyla eklendi!");
      router.push("/admin/urunler"); // Başarılı olunca ürün listesine yönlendir
      return true;
    } else {
      alert("Ürün eklenirken bir hata oluştu.");
      return false;
    }
  };

  if (loading) return <p>Yükleniyor...</p>;

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Yeni Ürün Ekle</h1>
      <div className="bg-white p-8 rounded-lg shadow-sm max-w-2xl mx-auto">
        <ProductForm categories={categories} onSubmit={handleCreateProduct} />
      </div>
    </div>
  );
}