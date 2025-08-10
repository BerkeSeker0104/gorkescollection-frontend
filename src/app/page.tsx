// Dosya Yolu: src/app/page.tsx
import { Category } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import { getProducts, getCategories, getFeaturedProducts } from '@/lib/api';
import ProductMarquee from '@/components/ProductMarquee';
import NewestGridPager from "@/components/NewestGridPager";

// Öne çıkan kategori tipi (statik görsel+açıklama ile DB'deki category birleşiyor)
type FeaturedCategory = Category & {
  image: string;
  description: string;
};

export default async function HomePage() {
  // 1) Öne çıkanlar (marquee)  2) En yeniler (alttaki grid)  3) Kategoriler
  const [featured, newestAll, allCategories] = await Promise.all([
    getFeaturedProducts(12),
    getProducts('newest'),
    getCategories(),
  ]);

  // Yeni çıkanlarda ilk 8 ürünü göster (isteğe göre arttırılabilir)
  const newest = (newestAll || []).slice(0, 8);

  // Statik öne çıkan kategori görselleri + açıklamalar
  const featuredCategoryData = [
    {
      slug: 'kolyeler',
      image: '/kolye-kategori.png',
      description:
        'Her detayı zarafetle tasarlanmış kolyelerimiz, günlük stilinize özel bir dokunuş katıyor. Minimal çizgilerden cesur parıltılara kadar uzanan koleksiyonumuzla anılarını ışıldat.',
    },
    {
      slug: 'bileklikler',
      image: '/bileklik-kategori.png',
      description:
        'Ruh halini yansıtan bilekliklerle tanış. İster zarif bir sade görünüm, ister neşeli renk detayları… Bu koleksiyonda her anın ruhu var.',
    },
    {
      slug: 'yuzukler',
      image: '/yuzuk-kategori.png',
      description:
        'Zarif bir dokunuşla gelen özgüven. Tek taşın sade şıklığından, çok taşlı tasarımların güçlü duruşuna kadar… Tarzını tamamlayan yüzüklerle her bakışta fark yarat.',
    },
  ];

  // Statik + DB kategori birleşimi
  const featuredCategories: FeaturedCategory[] = featuredCategoryData
    .map((staticCat) => {
      const dbCat = allCategories.find((c) => c.slug === staticCat.slug);
      return dbCat ? { ...staticCat, ...dbCat } : null;
    })
    .filter(Boolean) as FeaturedCategory[];

  return (
    <div className="bg-[#F7F5F2]">
      {/* Hero */}
      <section className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden">
        <video
          className="absolute top-1/2 left-1/2 w-full h-full object-cover -translate-x-1/2 -translate-y-1/2"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/hero-video.mp4" type="video/mp4" />
          Tarayıcınız video etiketini desteklemiyor.
        </video>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 h-full flex flex-col justify-end items-start text-white p-8 md:p-16">
          <p className="text-lg">İlkbahar–Yaz 2025</p>
          <h1 className="text-4xl md:text-6xl font-bold mt-2">Ruhun Işıltısı</h1>
          <p className="mt-4 max-w-md">
            Her parçayla kendini ifade et. Bu sezon ışığınla fark yaratmanın zamanı.
          </p>
          <Link
            href="/yeni-gelenler"
            className="mt-6 inline-block bg-white text-black font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition-colors"
          >
            Şimdi Keşfet
          </Link>
        </div>
      </section>

      {/* Kategori Vitrini */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Koleksiyonu Keşfet
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {featuredCategories.map((category) => (
            <Link
              key={category.id}
              href={`/${category.slug}`}
              className="group block text-center bg-white p-6 rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300"
            >
              <div className="overflow-hidden rounded-md aspect-square">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <h3 className="mt-6 text-2xl font-semibold text-gray-800">
                {category.name}
              </h3>

              <p className="mt-2 text-sm text-gray-500 leading-relaxed h-24">
                {category.description}
              </p>

              <span className="mt-4 inline-block text-sm font-medium text-gray-800 group-hover:underline">
                Şimdi Keşfet &rarr;
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Öne Çıkanlar (Marquee) */}
      {featured.length > 0 && (
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Öne Çıkanlar
          </h2>
          <ProductMarquee products={featured} />
        </section>
      )}

      {/* 4) Yeni Çıkanlar (2x4 ve sayfa sayfa) */}
<section className="container mx-auto px-6 pb-6">
  <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
    Yeni Gelenler
  </h2>
</section>
    </div>
  );
}