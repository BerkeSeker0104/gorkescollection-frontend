import type { MetadataRoute } from "next";

type Category = { slug: string; updatedAt?: string };
type Product  = { id: number; updatedAt?: string };

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://gorkescollection.com";
const api  = process.env.NEXT_PUBLIC_API_URL || "https://gorkes-api.onrender.com";

export const revalidate = 60 * 60 * 24; // 1 gün: Google'a günlük taze liste sun

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) throw new Error(`Fetch failed ${url} -> ${res.status}`);
  return res.json();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Her durumda var olacak temel sayfalar
  const urls: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/yeni-gelenler`, changeFrequency: "weekly", priority: 0.8 },
  ];

  try {
    // API uçların senin düzenine uyuyor: /api/categories ve /api/products
    // (Eğer sayfalama varsa burayı güncelleriz.)
    const [categories, products] = await Promise.all([
      fetchJSON<Category[]>(`${api}/api/categories`),
      fetchJSON<Product[]>(`${api}/api/products`),
    ]);

    for (const c of categories) {
      urls.push({
        url: `${base}/${c.slug}`,
        changeFrequency: "weekly",
        priority: 0.7,
        lastModified: c.updatedAt ? new Date(c.updatedAt) : undefined,
      });
    }

    for (const p of products) {
      urls.push({
        url: `${base}/urun/${p.id}`,
        changeFrequency: "weekly",
        priority: 0.6,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
      });
    }
  } catch (err) {
    // API erişilemezse bile ana sayfalar yayımlansın
    console.error("sitemap build error:", err);
  }

  return urls;
}
