// src/app/admin/urunler/yeni/page.tsx
"use client";

import ProductForm, { ProductFormData } from "@/components/ProductForm";
import { createProduct, getCategories } from "@/lib/api";
import { AdminProductDto, Category } from "@/types";
import { useEffect, useState } from "react";

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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
      obj[item.key] = item.value;
      return obj;
    }, {} as Record<string, string>);

    const finalData: AdminProductDto = {
      name: data.name,
      description: data.description,
      price: data.price,
      stockQuantity: data.stockQuantity,
      categoryId: data.categoryId,
      imageUrls: data.imageUrls,
      specifications: specsAsObject,
      isFeatured: (data as any).isFeatured ?? false,
    };

    const newProduct = await createProduct(finalData);
    return newProduct !== null;
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
