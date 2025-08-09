import type { MetadataRoute } from "next";

// Basit tipler (projeden import etmiyoruz; bu dosya server-only çalışır)
type Category = { slug: string; updatedAt?: string | null };
type Product  = { id: number; updatedAt?: string | null };

// Site ve API tabanı
const base = process.env.NEXT_PUBLIC_SITE_URL || "https://gorkescollection.com";
const api  = process.env.NEXT_PUBLIC_API_URL || "https://gorkes-api.onrender.com";

// Google'a günlük taze liste sun (ISR)
export const revalidate = 86400; // 24 saat


async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) throw new Error(`Fetch failed ${url} -> ${res.status}`);
  return res.json();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Her durumda olan sabit sayfalar
  const urls: MetadataRoute.Sitemap = [
    { url: `${base}/`,               changeFrequency: "weekly", priority: 1 },
    { url: `${base}/yeni-gelenler`,  changeFrequency: "weekly", priority: 0.8 },
  ];

  try {
    // Kategoriler ve ürünler
    // Not: endpointlerin tüm liste döndürdüğünü varsayıyorum.
    // Sayfalama varsa söyle, ona göre loop ekleyeyim.
    const [categories, products] = await Promise.all([
      fetchJSON<Category[]>(`${api}/api/categories`),
      fetchJSON<Product[]>(`${api}/api/products`),
    ]);

    // Kategoriler
    for (const c of categories) {
      urls.push({
        url: `${base}/${c.slug}`,
        changeFrequency: "weekly",
        priority: 0.7,
        lastModified: c.updatedAt ? new Date(c.updatedAt) : undefined,
      });
    }

    // Ürünler
    for (const p of products) {
      urls.push({
        url: `${base}/urun/${p.id}`,
        changeFrequency: "weekly",
        priority: 0.6,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      });
    }
  } catch (err) {
    // API erişilemezse en azından sabit sayfalar yayınlansın
    console.error("sitemap build error:", err);
  }

  return urls;
}
