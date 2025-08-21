// src/app/urun/[id]/page.tsx
"use client";

// YORUMLAR İÇİN GEREKLİ IMPORT'LAR (MEVCUT + EK)
import { Product, Review } from "@/types";
import { getReviewsForProduct } from "@/lib/api";
import StarRating from "@/components/StarRating";
import ReviewList from "@/components/ReviewList";
// --- YENİ: Yorum formu ve auth ---
import { useAuth } from "@/context/AuthContext";
import ReviewForm from "@/components/ReviewForm";
import Link from "next/link";
// ---

import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import FavoriteButton from "@/components/FavoriteButton";
import Autoplay from "embla-carousel-autoplay";

const PLACEHOLDER = "/placeholder.png";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // YORUMLAR: liste state'i
  const [reviews, setReviews] = useState<Review[]>([]);

  // Yorum formu için kullanıcı bilgisi
  const { user } = useAuth();

  // Lightbox durumu
  const [isLightboxOpen, setLightboxOpen] = useState(false);

  // Embla: ana slider + thumbnail slider
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center", skipSnaps: false, dragFree: false },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );
  const [thumbRef, thumbApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
    align: "start",
  });

  // ---------- AÇ/KAPA (mobil kapalı, masaüstünde açık) ----------
  const [isDesktop, setIsDesktop] = useState(false);
  const [openSpecs, setOpenSpecs] = useState(false);
  const [openReviews, setOpenReviews] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => {
      const desktop = mq.matches;
      setIsDesktop(desktop);
      setOpenSpecs(desktop);
      setOpenReviews(desktop);
    };
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);
  // --------------------------------------------------------------

  // ÜRÜN + YORUM VERİSİ: paralel çekim
  useEffect(() => {
    if (!id) return;
    const getProductAndReviews = async (pid: string) => {
      setLoading(true);
      try {
        const [productResponse, reviewsData] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${pid}`),
          getReviewsForProduct(pid),
        ]);

        if (productResponse.ok) {
          const productData = await productResponse.json();
          setProduct(productData);
        } else {
          setProduct(null);
        }

        setReviews(reviewsData);
      } catch (error) {
        console.error("Ürün ve yorumlar çekilirken bir hata oluştu:", error);
        setProduct(null);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    getProductAndReviews(id);
  }, [id]);

  // YORUM ÖZETİ: ortalama ve adet
  const reviewSummary = useMemo(() => {
    const count = reviews.length;
    if (count === 0) return { average: 0, count: 0 };
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = totalRating / count;
    return { average, count };
  }, [reviews]);

  // Yorum formu submit → listeyi anında güncelle
  const reviewFormRef = useRef<HTMLDivElement | null>(null);
  const handleReviewSubmitted = (newReview: Review) => {
    setReviews((prev) => [newReview, ...prev]);
    setOpenReviews(true);
    setTimeout(() => {
      reviewFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  // Görseller
  const images = useMemo(() => {
    const arr = product?.imageUrls?.filter((u) => !!u) ?? [];
    return arr.length > 0 ? arr : [PLACEHOLDER];
  }, [product]);

  // Embla seçimi
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    const i = emblaApi.selectedScrollSnap();
    setSelectedIndex(i);
    if (thumbApi) {
      thumbApi.scrollTo(i);
    }
  }, [emblaApi, thumbApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    setSelectedIndex(0);
    emblaApi?.scrollTo(0, true);
    thumbApi?.scrollTo(0, true);
  }, [product?.id, emblaApi, thumbApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  // Lightbox
  const openLightbox = useCallback(() => {
    if (images.length === 1 && images[0] === PLACEHOLDER) return;
    setLightboxOpen(true);
  }, [images]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  // Lightbox klavye kısayolları
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;

      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        scrollNext();
      } else if (e.key === "ArrowLeft") {
        scrollPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, closeLightbox, scrollNext, scrollPrev]);

  if (loading) return <div className="pt-40 text-center">Yükleniyor...</div>;
  if (!product) return <div className="pt-40 text-center">Ürün bulunamadı.</div>;

  // “Yorum Yap” butonundan forma kaydır
  const scrollToReviewForm = () => {
    setOpenReviews(true);
    reviewFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <div className="bg-white pt-32">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
            {/* Sol: Görsel Galeri (Embla) */}
            <div>
              {/* Ana slider */}
              <div className="relative">
                <div className="overflow-hidden rounded-lg" ref={emblaRef}>
                  <div className="flex">
                    {images.map((url, i) => (
                      <div
                        className="min-w-0 flex-[0_0_100%] relative aspect-square cursor-pointer"
                        key={i}
                        onClick={openLightbox}
                      >
                        <Image
                          src={url}
                          alt={`${product.name} - ${i + 1}`}
                          fill
                          sizes="(max-width: 768px) 90vw, 45vw"
                          className="w-full h-full object-cover"
                          priority={i === 0}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={scrollPrev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-opacity focus:outline-none focus:ring-2 focus:ring-gray-900"
                      aria-label="Önceki görsel"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={scrollNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-opacity focus:outline-none focus:ring-2 focus:ring-gray-900"
                      aria-label="Sonraki görsel"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="mt-4">
                  <div className="overflow-hidden" ref={thumbRef}>
                    <div className="flex gap-3">
                      {images.map((url, index) => (
                        <button
                          key={index}
                          onClick={() => onThumbClick(index)}
                          className={`relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 ${
                            selectedIndex === index ? "border-gray-900" : "border-transparent"
                          }`}
                          aria-label={`Görsel ${index + 1}`}
                        >
                          <Image
                            src={url}
                            alt={`${product.name} thumbnail ${index + 1}`}
                            fill
                            sizes="80px"
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sağ: Bilgiler */}
            <div className="mt-4 md:mt-0">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {product.name}
              </h1>

              {/* YORUM ÖZETİ (sayfanın üstünde küçük gösterim) */}
              <div className="mt-3 flex items-center">
                {reviewSummary.count > 0 ? (
                  <>
                    <StarRating rating={reviewSummary.average} starSize={20} />
                    <a
                      href="#reviews"
                      className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      onClick={(e) => {
                        e.preventDefault();
                        setOpenReviews(true);
                        document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                    >
                      {reviewSummary.count} yorum
                    </a>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Henüz yorum yapılmamış</p>
                )}
              </div>

              <p className="mt-4 text-3xl tracking-tight text-gray-900">
                {typeof product.price === "number"
                  ? product.price.toLocaleString("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    })
                  : `${product.price} TL`}
              </p>

              <div
                className="mt-6 text-base text-gray-700 space-y-4"
                dangerouslySetInnerHTML={{ __html: product.description || "" }}
              />

              <div className="mt-10 flex items-stretch gap-3">
                <div className="flex-1">
                  <AddToCartButton productId={product.id} />
                </div>
                <FavoriteButton
                  product={product}
                  size={28}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md px-4 flex items-center"
                />
              </div>

              {/* ÖZELLİKLER - AÇILIR/KAPANIR */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mt-10">
                  {/* Başlık butonu */}
                  <button
                    type="button"
                    onClick={() => setOpenSpecs((s) => !s)}
                    className="w-full flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 bg-white hover:bg-gray-50"
                    aria-expanded={openSpecs}
                  >
                    <span className="text-lg font-semibold text-gray-900">Özellikler</span>
                    <svg
                      className={`h-5 w-5 transition-transform ${openSpecs ? "rotate-180" : ""}`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* İçerik: sadece açıkken göster */}
                  {(openSpecs || isDesktop) && (
                    <div className="mt-4 border border-gray-200 rounded-lg p-4">
                      <dl className="divide-y divide-gray-200">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 py-3">
                            <dt className="font-medium text-gray-900">{key}</dt>
                            <dd className="sm:col-span-2 mt-1 sm:mt-0">{String(value)}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* YORUMLAR - AÇILIR/KAPANIR */}
          <div id="reviews" className="mt-16">
            {/* Başlık butonu */}
            <button
              type="button"
              onClick={() => setOpenReviews((s) => !s)}
              className="w-full flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3 bg-white hover:bg-gray-50"
              aria-expanded={openReviews}
            >
              <span className="text-lg font-bold text-gray-900">Yorumlar ({reviewSummary.count})</span>
              <svg
                className={`h-5 w-5 transition-transform ${openReviews ? "rotate-180" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* İçerik: sadece açıkken göster */}
            {(openReviews || isDesktop) && (
              <div className="mt-4 border border-gray-200 rounded-lg p-4">
                {/* ÜST ÖZET: solda büyük puan + yıldızlar; sağda “Yorum Yap” */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="md:col-span-2 flex items-center gap-4">
                    <div className="text-5xl font-semibold text-gray-900 tabular-nums">
                      {reviewSummary.average.toFixed(1)}
                    </div>
                    <div>
                      <StarRating rating={reviewSummary.average} starSize={20} />
                      <div className="text-sm text-gray-600 mt-1">{reviewSummary.count} Değerlendirme</div>
                    </div>
                  </div>

                  <div className="flex md:justify-end">
                    <button
                      type="button"
                      onClick={scrollToReviewForm}
                      className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                    >
                      Yorum Yap
                    </button>
                  </div>
                </div>

                {/* İçerik grid: sol form, sağ liste */}
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-10">
                  {/* SOL: Yorum Yazma */}
                  <div className="lg:col-span-1">
                    <h3 className="text-lg font-medium text-gray-900">Yorumunuzu Paylaşın</h3>
                    <div ref={reviewFormRef} className="mt-4">
                      {user ? (
                        <ReviewForm productId={product.id} onReviewSubmitted={handleReviewSubmitted} />
                      ) : (
                        <div className="p-4 border rounded-md text-sm text-gray-700 bg-gray-50">
                          Yorum yapmak için{" "}
                          <Link href="/giris" className="font-medium text-indigo-600 hover:underline">
                            giriş yapmanız
                          </Link>{" "}
                          gerekmektedir.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SAĞ: Yorum Listesi */}
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900">Müşteri Yorumları</h3>
                    <div className="mt-4">
                      <ReviewList reviews={reviews} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal (mevcut davranış korunur) */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={closeLightbox}
        >
          {/* Kapatma Butonu */}
          <button
            className="absolute top-4 right-4 text-white text-5xl font-bold z-[52] hover:text-gray-300 transition-colors"
            aria-label="Galeriyi kapat"
            onClick={closeLightbox}
          >
            &times;
          </button>

          {/* Navigasyon ve Resim Konteyneri */}
          <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {/* Önceki Buton */}
            {images.length > 1 && (
              <button
                onClick={scrollPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-2 text-white z-[52] transition-colors"
                aria-label="Önceki görsel"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Büyük Resim */}
            <div className="relative w-full h-full max-w-5xl max-h-[90vh]">
              <Image
                src={images[selectedIndex]}
                alt={`Büyük resim ${product?.name} - ${selectedIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {/* Sonraki Buton */}
            {images.length > 1 && (
              <button
                onClick={scrollNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-2 text-white z-[52] transition-colors"
                aria-label="Sonraki görsel"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}