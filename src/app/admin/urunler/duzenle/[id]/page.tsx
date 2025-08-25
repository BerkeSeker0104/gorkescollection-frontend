// src/app/admin/urunler/duzenle/[id]/page.tsx
"use client";

import ProductForm, { ProductFormData } from "@/components/ProductForm";
import { AdminProductDto, Category, Product } from "@/types";
import { getCategories, getProductById, updateProduct } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SubscriberList from "@/components/admin/SubscriberList";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params?.id);
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [cats, prod] = await Promise.all([
          getCategories(),
          getProductById(productId),
        ]);
        if (!active) return;
        setCategories(cats);
        setProduct(prod);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (!Number.isFinite(productId)) {
      router.push("/admin/urunler");
      return;
    }

    load();
    return () => {
      active = false;
    };
  }, [productId, router]);

  // --- helpers ---
  const resolveCategoryId = (p: Product | null, cats: Category[]) => {
    if (!p) return cats?.[0]?.id ?? 0;
    const fromFlat = (p as unknown as { categoryId?: number })?.categoryId;
    const fromRel = (p as unknown as { category?: { id?: number } })?.category?.id;
    return Number(fromFlat ?? fromRel ?? cats?.[0]?.id ?? 0);
  };

  // backend’ten ISO (UTC) gelebilir; datetime-local input için "YYYY-MM-DDTHH:mm" üret
  const toLocalInput = (iso?: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  };

  // Product -> ProductFormData
  const initialData: ProductFormData | undefined = useMemo(() => {
    if (!product) return undefined;

    const specsObj =
      (product as unknown as { specifications?: Record<string, string> })
        .specifications ?? {};
    const specsArray = Object.entries(specsObj).map(([key, value]) => ({
      key,
      value: String(value ?? ""),
    }));

    // imageUrls her zaman string[]
    const imageUrls: string[] = Array.isArray((product as any).imageUrls)
      ? ((product as any).imageUrls.filter(Boolean) as string[])
      : [];

    // saleType union'a indir
    const rawSaleType = (product as any).saleType;
    const saleType: "percentage" | "amount" | null =
      rawSaleType === "percentage" || rawSaleType === "amount" ? rawSaleType : null;

    // saleValue number | null
    const rawSaleValue = (product as any).saleValue;
    const saleValue: number | null =
      typeof rawSaleValue === "number" ? rawSaleValue : null;

    return {
      // ZORUNLU ALAN: sku (eksikse boş string ver)
      sku: (product as any).sku ?? "",

      name: String(product.name ?? ""),
      description: String((product as any).description ?? ""),
      price: Number((product as any).price ?? 0),
      stockQuantity: Number((product as any).stockQuantity ?? 0),
      categoryId: resolveCategoryId(product, categories),
      imageUrls,
      specifications: specsArray,
      isFeatured: Boolean((product as any).isFeatured),

      // --- İNDİRİM ALANLARI (Form şemanla uyumlu) ---
      saleType,
      saleValue,
      saleStartUtc: toLocalInput((product as any).saleStartUtc),
      saleEndUtc: toLocalInput((product as any).saleEndUtc),
      // opsiyonel alan; string ya da null bırak
      saleLabel:
        (product as any).saleLabel === undefined || (product as any).saleLabel === null
          ? null
          : String((product as any).saleLabel),
    };
  }, [product, categories]);

  const handleUpdateProduct = async (data: ProductFormData) => {
    if (!product) return false;

    const specifications = (data.specifications || []).reduce((obj, it) => {
      if (it.key && it.value) obj[it.key] = it.value;
      return obj;
    }, {} as Record<string, string>);

    const payload: AdminProductDto = {
      id: productId,
      name: data.name,
      description: data.description,
      price: data.price,
      stockQuantity: data.stockQuantity,
      categoryId: data.categoryId,
      imageUrls: data.imageUrls,
      specifications,
      isFeatured: Boolean(data.isFeatured),

      // --- İNDİRİM ALANLARI (Form submit’i ISO/UTC verecek şekilde ayarlı) ---
      saleType: (data.saleType ?? null) as "percentage" | "amount" | null,
      saleValue: data.saleValue ?? null,
      saleStartUtc: data.saleStartUtc ?? null,
      saleEndUtc: data.saleEndUtc ?? null,
      saleLabel: data.saleLabel ?? null,
    };

    const ok = await updateProduct(
      (product as unknown as { id: number }).id,
      payload
    );

    if (ok) {
      alert("Ürün güncellendi");
      router.push("/admin/urunler");
      return true;
    } else {
      alert("Güncelleme başarısız. Lütfen tekrar deneyin.");
      return false;
    }
  };

  if (loading) return <p>Yükleniyor...</p>;
  if (!product) return <p>Ürün bulunamadı.</p>;

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Ürünü Düzenle</h1>
      <div className="bg-white p-8 rounded-lg shadow-sm max-w-2xl mx-auto">
        <ProductForm
          initialData={initialData}
          categories={categories}
          onSubmit={handleUpdateProduct}
        />

        {/* --- YENİ EKLENEN BÖLÜM --- */}
        <SubscriberList productId={productId} />
      </div>
    </div>
  );
}