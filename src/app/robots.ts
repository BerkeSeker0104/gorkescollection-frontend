import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://gorkescollection.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/hesabim", "/giris", "/kayit", "/odeme"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
