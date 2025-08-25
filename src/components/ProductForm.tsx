// src/components/ProductForm.tsx

"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Category } from "@/types";
import { useRef, useState } from "react";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";

// GÜNCELLENDİ: Zod Şeması
const productSchema = z
  .object({
    // YENİ ALAN
    sku: z.string().min(1, "Ürün Kodu (SKU) gerekli"),

    name: z.string().min(1, "Ürün adı gerekli"),
    description: z.string().min(1, "Açıklama gerekli"),
    price: z.number().min(0, "Fiyat 0'dan küçük olamaz"),
    stockQuantity: z.number().min(0, "Stok 0'dan küçük olamaz"),
    categoryId: z.number().int().nonnegative("Kategori seçin"),
    imageUrls: z
      .array(z.string().url("Geçerli bir resim URL'si girin"))
      .min(1, "En az 1 görsel ekleyin"),
    specifications: z.array(
      z.object({
        key: z.string().min(1, "Özellik adı gerekli"),
        value: z.string().min(1, "Özellik değeri gerekli"),
      })
    ),
    isFeatured: z.boolean(),
    
    // YENİ ALAN
    displayOrder: z.number().min(0, "Sıralama negatif olamaz").nullable().optional(),

    // --- İndirim alanları ---
    saleType: z.enum(["percentage", "amount"]).nullable().optional(),
    saleValue: z.number().min(0, "Negatif olamaz").nullable().optional(),
    saleStartUtc: z.string().nullable().optional(),
    saleEndUtc: z.string().nullable().optional(),
    saleLabel: z.string().max(32, "En fazla 32 karakter").nullable().optional(),
  })
  .refine(
    (d) => {
      if (!d.saleType) return true;
      return typeof d.saleValue === "number" && d.saleValue > 0;
    },
    { path: ["saleValue"], message: "İndirim değeri zorunlu ve 0'dan büyük olmalı" }
  );

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: ProductFormData;
  categories: Category[];
  onSubmit: (data: ProductFormData) => Promise<boolean>;
}

export default function ProductForm({
  initialData,
  categories,
  onSubmit,
}: ProductFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputsRef = useRef<Record<number, HTMLInputElement | null>>({});

  const {
    register,
    handleSubmit,
    watch,
    setError,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    // GÜNCELLENDİ: Varsayılan Değerler
    defaultValues: initialData || {
      sku: "", // YENİ
      name: "",
      description: "",
      price: 0,
      stockQuantity: 0,
      categoryId: categories?.[0]?.id ?? 0,
      imageUrls: [""],
      specifications: [],
      isFeatured: false,
      displayOrder: null, // YENİ

      // İndirim defaultları
      saleType: null,
      saleValue: null,
      saleStartUtc: null,
      saleEndUtc: null,
      saleLabel: null,
    },
  });

  // Watches
  const imageUrls = watch("imageUrls");
  const specifications = watch("specifications");
  const currentCategoryId = watch("categoryId");
  const saleType = watch("saleType");

  /* -------------- Görseller helpers -------------- */
  const addImageUrl = () =>
    setValue("imageUrls", [...(imageUrls ?? []), ""], {
      shouldDirty: true,
      shouldValidate: true,
    });

  const removeImageUrl = (index: number) =>
    setValue(
      "imageUrls",
      (imageUrls ?? []).filter((_, i) => i !== index),
      { shouldDirty: true, shouldValidate: true }
    );

  const setImageUrlAt = (index: number, value: string) => {
    const next = [...(imageUrls ?? [])];
    next[index] = value;
    setValue("imageUrls", next, { shouldDirty: true, shouldValidate: true });
  };

  /* -------------- Özellikler helpers -------------- */
  const addSpecification = () =>
    setValue("specifications", [...(specifications ?? []), { key: "", value: "" }], {
      shouldDirty: true,
      shouldValidate: true,
    });

  const removeSpecification = (index: number) =>
    setValue(
      "specifications",
      (specifications ?? []).filter((_, i) => i !== index),
      { shouldDirty: true, shouldValidate: true }
    );

  const setSpecificationKeyAt = (index: number, val: string) => {
    const next = [...(specifications ?? [])];
    next[index] = { ...next[index], key: val };
    setValue("specifications", next, { shouldDirty: true, shouldValidate: true });
  };

  const setSpecificationValueAt = (index: number, val: string) => {
    const next = [...(specifications ?? [])];
    next[index] = { ...next[index], value: val };
    setValue("specifications", next, { shouldDirty: true, shouldValidate: true });
  };

  /* -------------- Cloudinary upload -------------- */
  const openFilePicker = (index: number) => {
    fileInputsRef.current[index]?.click();
  };

  const handleFileSelected = async (index: number, file: File | null) => {
    if (!file) return;
    setUploadError(null);
    setUploadingIndex(index);
    try {
      const secureUrl = await uploadToCloudinary(file);
      setImageUrlAt(index, secureUrl);
    } catch (err: any) {
      setUploadError(err?.message || "Görsel yüklenemedi");
    } finally {
      setUploadingIndex(null);
    }
  };

  /* -------------- Submit -------------- */
  const toIsoOrNull = (localStr: string | null | undefined) => {
    if (!localStr) return null;
    const d = new Date(localStr);
    return isNaN(d.getTime()) ? null : d.toISOString();
  };

  const submitHandler: SubmitHandler<ProductFormData> = async (data) => {
    const cleanedImageUrls = (data.imageUrls || [])
      .map((u) => u.trim())
      .filter(Boolean);

    const cleanedSpecifications = (data.specifications || []).filter(
      (s) => s.key.trim() && s.value.trim()
    );

    if (cleanedImageUrls.length === 0) {
      setError("imageUrls", {
        type: "manual",
        message: "En az bir geçerli görsel URL'i gerekli",
      });
      return;
    }

    let saleTypeFinal = data.saleType ?? null;
    let saleValueFinal =
      saleTypeFinal ? (typeof data.saleValue === "number" ? data.saleValue : null) : null;
    let saleStartIso = saleTypeFinal ? toIsoOrNull(data.saleStartUtc) : null;
    let saleEndIso = saleTypeFinal ? toIsoOrNull(data.saleEndUtc) : null;
    let saleLabelFinal = saleTypeFinal ? (data.saleLabel?.trim() || null) : null;

    setSubmitting(true);
    const ok = await onSubmit({
      ...data,
      imageUrls: cleanedImageUrls,
      specifications: cleanedSpecifications,
      saleType: saleTypeFinal,
      saleValue: saleValueFinal ?? null,
      saleStartUtc: saleStartIso,
      saleEndUtc: saleEndIso,
      saleLabel: saleLabelFinal,
    });
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
      {/* Ürün Adı */}
      <div>
        <label className="block text-sm font-medium mb-1">Ürün Adı</label>
        <input className="w-full border rounded px-3 py-2" {...register("name")} />
        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
      </div>

      {/* Açıklama */}
      <div>
        <label className="block text-sm font-medium mb-1">Açıklama</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          rows={4}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* YENİ BÖLÜM: SKU ve Sıralama */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Ürün Kodu (SKU)</label>
          <input
            {...register("sku")}
            className="w-full border rounded px-3 py-2"
            placeholder="Örn: GK-KOLYE-001"
          />
          {errors.sku && <p className="text-red-600 text-sm mt-1">{errors.sku.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sıralama Önceliği (ops.)</label>
          <input
            type="number"
            {...register("displayOrder", {
              setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
            })}
            className="w-full border rounded px-3 py-2"
            placeholder="Düşük numara üste gelir"
          />
          {errors.displayOrder && <p className="text-red-600 text-sm mt-1">{errors.displayOrder.message}</p>}
        </div>
      </div>
      
      {/* Fiyat & Stok */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Fiyat</label>
          <input
            type="number"
            step="0.01"
            {...register("price", {
              setValueAs: (v) => {
                if (typeof v === "string") {
                  const parsed = parseFloat(v.replace(",", "."));
                  return Number.isNaN(parsed) ? undefined : parsed;
                }
                return v;
              },
            })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Stok</label>
          <input
            type="number"
            {...register("stockQuantity", { valueAsNumber: true })}
            className="w-full border rounded px-3 py-2"
          />
          {errors.stockQuantity && (
            <p className="text-red-600 text-sm mt-1">{errors.stockQuantity.message}</p>
          )}
        </div>
      </div>

      {/* Kategori */}
      <div>
        <label className="block text-sm font-medium mb-1">Kategori</label>
        <select
          {...register("categoryId", { valueAsNumber: true })}
          value={currentCategoryId}
          className="w-full border rounded px-3 py-2"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="text-red-600 text-sm mt-1">{errors.categoryId.message}</p>
        )}
      </div>

      {/* Öne Çıkan */}
      <div className="flex items-center gap-2">
        <input type="checkbox" {...register("isFeatured")} className="h-4 w-4" />
        <label className="text-sm">Öne Çıkan</label>
      </div>

      {/* -------- İNDİRİM -------- */}
      <div className="rounded-lg border p-4 space-y-4 bg-white">
        <div className="font-semibold text-gray-800">İndirim</div>

        {/* Tip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">İndirim Tipi</label>
            <select
              className="w-full border rounded px-3 py-2"
              {...register("saleType")}
              onChange={(e) => {
                const val = e.target.value as "percentage" | "amount" | "";
                // Tip temizlenirse diğer alanları da sıfırla
                if (!val) {
                  setValue("saleType", null, { shouldValidate: true, shouldDirty: true });
                  setValue("saleValue", null, { shouldValidate: true, shouldDirty: true });
                  setValue("saleStartUtc", null, { shouldValidate: true, shouldDirty: true });
                  setValue("saleEndUtc", null, { shouldValidate: true, shouldDirty: true });
                  setValue("saleLabel", null, { shouldValidate: true, shouldDirty: true });
                } else {
                  setValue("saleType", val, { shouldValidate: true, shouldDirty: true });
                }
              }}
              value={saleType ?? ""}
            >
              <option value="">— Yok —</option>
              <option value="percentage">% Yüzde</option>
              <option value="amount">₺ Tutar</option>
            </select>
          </div>

          {/* Değer */}
          <div>
            <label className="block text-sm font-medium mb-1">
              İndirim Değeri {saleType === "percentage" ? "(%)" : saleType === "amount" ? "(₺)" : ""}
            </label>
            <input
              type="number"
              step={saleType === "percentage" ? "1" : "0.01"}
              disabled={!saleType}
              className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
              {...register("saleValue", {
                setValueAs: (v) => {
                  if (!saleType) return null;
                  if (typeof v === "string" && v.trim() === "") return null;
                  const parsed = typeof v === "string" ? parseFloat(v.replace(",", ".")) : v;
                  return Number.isNaN(parsed) ? null : parsed;
                },
              })}
            />
            {errors.saleValue && (
              <p className="text-red-600 text-sm mt-1">{errors.saleValue.message as string}</p>
            )}
          </div>

          {/* Rozet */}
          <div>
            <label className="block text-sm font-medium mb-1">Rozet (ops.)</label>
            <input
              type="text"
              maxLength={32}
              disabled={!saleType}
              className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
              placeholder='Örn: "Sezon Sonu", "Haftanın İndirimi"'
              {...register("saleLabel")}
            />
            {errors.saleLabel && (
              <p className="text-red-600 text-sm mt-1">{errors.saleLabel.message as string}</p>
            )}
          </div>
        </div>

        {/* Tarihler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Başlangıç (UTC tabanlı)</label>
            <input
              type="datetime-local"
              disabled={!saleType}
              className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
              {...register("saleStartUtc")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bitiş (UTC tabanlı)</label>
            <input
              type="datetime-local"
              disabled={!saleType}
              className="w-full border rounded px-3 py-2 disabled:bg-gray-100"
              {...register("saleEndUtc")}
            />
          </div>
        </div>
      </div>
      {/* -------- /İNDİRİM -------- */}

      {/* Görseller */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium mb-1">Görseller</label>
          <button type="button" className="text-sm underline" onClick={addImageUrl}>
            + Yeni Satır
          </button>
        </div>
        {(imageUrls ?? []).map((val, index) => (
          <div key={index} className="flex gap-2 mb-2 items-center">
            <input
              className="flex-1 border rounded px-3 py-2"
              value={val}
              onChange={(e) => setImageUrlAt(index, e.target.value)}
              placeholder="https://..."
            />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={(el) => {
                fileInputsRef.current[index] = el;
              }}
              onChange={(e) => handleFileSelected(index, e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              className="px-3 py-2 border rounded"
              onClick={() => openFilePicker(index)}
              disabled={uploadingIndex === index}
            >
              {uploadingIndex === index ? "Yükleniyor..." : "Yükle"}
            </button>
            <button
              type="button"
              className="px-3 py-2 border rounded"
              onClick={() => removeImageUrl(index)}
            >
              Sil
            </button>
          </div>
        ))}
        {uploadError && <p className="text-red-600 text-sm mt-1">{uploadError}</p>}
        {errors.imageUrls && (
          <p className="text-red-600 text-sm mt-1">{(errors.imageUrls as any)?.message}</p>
        )}
      </div>

      {/* Özellikler */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium mb-1">Ürün Özellikleri</label>
          <button type="button" className="text-sm underline" onClick={addSpecification}>
            + Özellik Ekle
          </button>
        </div>
        {(specifications ?? []).length === 0 && (
          <p className="text-xs text-gray-500 mb-2">
            Opsiyonel. İstediğin kadar key–value ekleyebilirsin.
          </p>
        )}
        {(specifications ?? []).map((spec, index) => (
          <div key={index} className="grid grid-cols-3 gap-2 mb-2">
            <input
              className="border rounded px-3 py-2"
              placeholder="Özellik Adı"
              value={spec.key}
              onChange={(e) => setSpecificationKeyAt(index, e.target.value)}
            />
            <input
              className="border rounded px-3 py-2"
              placeholder="Değer"
              value={spec.value}
              onChange={(e) => setSpecificationValueAt(index, e.target.value)}
            />
            <button
              type="button"
              className="px-3 py-2 border rounded"
              onClick={() => removeSpecification(index)}
            >
              Sil
            </button>
          </div>
        ))}
      </div>

      {/* Kaydet */}
      <button
        type="submit"
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-60"
        disabled={submitting}
      >
        {submitting ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </form>
  );
}