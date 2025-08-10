// src/app/sitemap.xml/route.ts
import { NextResponse } from "next/server";

type Category = { slug: string; updatedAt?: string | null };
type Product  = { id: number; updatedAt?: string | null };

// Bu route'u her zaman runtime'da çalıştır:
export const dynamic  = "force-dynamic"; // build sırasında pre-render etme
export const runtime  = "nodejs";        // istersen "edge" de kullanabilirsin
export const revalidate = 0;

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://gorkescollection.com";
const api  = process.env.NEXT_PUBLIC_API_URL || "https://gorkes-api.onrender.com";

// Güvenli fetch (time-out yok ama try/catch var) ve dizi/objeyi normalize eden yardımcılar
async function fetchJSON<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function getAllCategories(): Promise<Category[]> {
  const data = await fetchJSON<Category[]>(`${api}/api/categories`);
  return Array.isArray(data) ? data : [];
}

async function getAllProductsLimited(maxPages = 5, pageSize = 100): Promise<Product[]> {
  // Backend’in /api/products endpoint’i genelde { items, total, page, pageSize } döndürüyor.
  // Burada ilk birkaç sayfayı toplayıp sitemap’i hızlı döndürüyoruz.
  const all: Product[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const pageUrl = `${api}/api/products?page=${page}&pageSize=${pageSize}`;
    const resp = await fetchJSON<any>(pageUrl);
    if (!resp) break;

    let items: Product[] = [];
    if (Array.isArray(resp)) {
      // Eski format (direkt dizi)
      items = resp as Product[];
    } else if (resp && Array.isArray(resp.items)) {
      // Yeni format
      items = resp.items as Product[];
    } else {
      break;
    }

    all.push(...items);
    if (items.length < pageSize) break; // son sayfaya geldik
  }
  return all;
}

export async function GET() {
  const chunks: string[] = [];

  // Sabit sayfalar
  chunks.push(`
    <url>
      <loc>${base}/</loc>
      <changefreq>weekly</changefreq>
      <priority>1.0</priority>
    </url>
    <url>
      <loc>${base}/yeni-gelenler</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `);

  try {
    const [categories, products] = await Promise.all([
      getAllCategories(),
      getAllProductsLimited(3, 100), // max 300 ürünle sınırla (hız için)
    ]);

    // Kategoriler
    for (const c of categories) {
      chunks.push(`
        <url>
          <loc>${base}/${c.slug}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
          ${c.updatedAt ? `<lastmod>${new Date(c.updatedAt).toISOString()}</lastmod>` : ""}
        </url>
      `);
    }

    // Ürünler
    for (const p of products) {
      chunks.push(`
        <url>
          <loc>${base}/urun/${p.id}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.6</priority>
          ${p.updatedAt ? `<lastmod>${new Date(p.updatedAt).toISOString()}</lastmod>` : ""}
        </url>
      `);
    }
  } catch (err) {
    // API erişilemezse en azından sabit sayfalar yayınlansın
    console.error("sitemap runtime error:", err);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${chunks.join("\n")}
  </urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}