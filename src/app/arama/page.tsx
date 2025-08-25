// Dosya: src/app/arama/page.tsx (GÜNCELLENMİŞ HALİ)

import { SearchResults } from "@/components/SearchResults";
import { Suspense } from 'react';

// Bu, Next.js App Router sayfaları için en doğru ve standart tip tanımıdır.
export default function SearchPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const queryParam = searchParams?.q;
  const query = Array.isArray(queryParam) ? queryParam[0] : queryParam || "";

  return (
    <div className="container mx-auto px-4 py-8 pt-32">
      <h1 className="text-3xl font-bold mb-2">Arama Sonuçları</h1>
      <p className="mb-8 text-gray-600">
        <span className="font-semibold">"{query}"</span> için bulunan sonuçlar:
      </p>

      {/* Veri çekme işlemi sırasında sayfanın geri kalanının yüklenmesi için Suspense kullanıyoruz */}
      <Suspense fallback={<p>Yükleniyor...</p>}>
        {/* Asıl işi bu bileşen yapacak */}
        <SearchResults query={query} />
      </Suspense>
    </div>
  );
}