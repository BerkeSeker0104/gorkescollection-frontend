"use client";

import { Product, Review } from "@/types";
import { getReviewsForProduct } from "@/lib/api";
import StarRating from "@/components/StarRating";
import ReviewList from "@/components/ReviewList";
import { useAuth } from "@/context/AuthContext";
import ReviewForm from "@/components/ReviewForm";
import Link from "next/link";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import useEmblaCarousel from "embla-carousel-react";
import FavoriteButton from "@/components/FavoriteButton";
import Autoplay from "embla-carousel-autoplay";
import StockNotificationButton from '@/components/StockNotificationButton';
import MobileAddToCartBar from '@/components/MobileAddToCartBar';

const PLACEHOLDER = "/placeholder.png";

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const { user } = useAuth();
  const [isLightboxOpen, setLightboxOpen] = useState(false);
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

  const WHATSAPP_PHONE_NUMBER = '905308331705';

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

  const reviewSummary = useMemo(() => {
    const count = reviews.length;
    if (count === 0) return { average: 0, count: 0 };
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = totalRating / count;
    return { average, count };
  }, [reviews]);

  const handleReviewSubmitted = (newReview: Review) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  // --- 1. YENİ FONKSİYONU EKLEYİN ---
  // Bu fonksiyon, ReviewList component'inden çağrılacak ve yorum listesini güncelleyecektir.
  const handleReviewDeleted = (deletedReviewId: number) => {
    setReviews((prev) => prev.filter(review => review.id !== deletedReviewId));
  };

  const images = useMemo(() => {
    const arr = product?.imageUrls?.filter((u) => !!u) ?? [];
    return arr.length > 0 ? arr : [PLACEHOLDER];
  }, [product]);

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

  const openLightbox = useCallback(() => {
    if (images.length === 1 && images[0] === PLACEHOLDER) return;
    setLightboxOpen(true);
  }, [images]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") scrollNext();
      else if (e.key === "ArrowLeft") scrollPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, closeLightbox, scrollNext, scrollPrev]);

  if (loading) return <div className="pt-40 text-center">Yükleniyor...</div>;
  if (!product) return <div className="pt-40 text-center">Ürün bulunamadı.</div>;

  return (
    <>
      <MobileAddToCartBar product={product} phoneNumber={WHATSAPP_PHONE_NUMBER} />
      
      <div className="bg-white pt-32 pb-24 md:pb-0">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
            {/* Sol: Görsel Galeri (Embla) */}
            <div>
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
                    <button type="button" onClick={scrollPrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-opacity focus:outline-none focus:ring-2 focus:ring-gray-900" aria-label="Önceki görsel">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button type="button" onClick={scrollNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-opacity focus:outline-none focus:ring-2 focus:ring-gray-900" aria-label="Sonraki görsel">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="mt-4">
                  <div className="overflow-hidden" ref={thumbRef}>
                    <div className="flex gap-3">
                      {images.map((url, index) => (
                        <button key={index} onClick={() => onThumbClick(index)} className={`relative aspect-square w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 ${selectedIndex === index ? "border-gray-900" : "border-transparent"}`} aria-label={`Görsel ${index + 1}`}>
                          <Image src={url} alt={`${product.name} thumbnail ${index + 1}`} fill sizes="80px" className="h-full w-full object-cover" />
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
              <div className="mt-3 flex items-center">
                {reviewSummary.count > 0 ? (
                  <>
                    <StarRating rating={reviewSummary.average} starSize={20} />
                    <a href="#reviews" className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500">{reviewSummary.count} yorum</a>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Henüz yorum yapılmamış</p>
                )}
              </div>
              <p className="mt-4 text-3xl tracking-tight text-gray-900">
                {typeof product.price === "number" ? product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" }) : `${product.price} TL`}
              </p>
              <div className="mt-6 text-base text-gray-700 space-y-4" dangerouslySetInnerHTML={{ __html: product.description || "" }} />

              <div className="hidden md:flex mt-10 items-stretch gap-3">
                <div className="flex-1">
                  {product.stockQuantity > 0 ? (
                    <AddToCartButton productId={product.id} />
                  ) : (
                    <StockNotificationButton productId={product.id} />
                  )}
                </div>
                <FavoriteButton product={product} size={28} className="bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md px-4 flex items-center" />
              </div>

              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mt-10 border-t border-gray-200 pt-10">
                  <h3 className="text-sm font-medium text-gray-900">Özellikler</h3>
                  <div className="mt-4 text-sm text-gray-700">
                    <dl className="divide-y divide-gray-200">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 py-3">
                          <dt className="font-medium text-gray-900">{key}</dt>
                          <dd className="sm:col-span-2 mt-1 sm:mt-0">{String(value)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Yorumlar Bölümü */}
          <div id="reviews" className="mt-16 pt-10 border-t border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-10">
              <div className="lg:col-span-1">
                <h3 className="text-lg font-medium text-gray-900">Yorumunuzu Paylaşın</h3>
                {user ? (
                  <div className="mt-4"><ReviewForm productId={product.id} onReviewSubmitted={handleReviewSubmitted} /></div>
                ) : (
                  <div className="mt-4 p-4 border rounded-md text-sm text-gray-700 bg-gray-50">Yorum yapmak için <Link href="/giris" className="font-medium text-indigo-600 hover:underline">giriş yapmanız</Link> gerekmektedir.</div>
                )}
              </div>
              <div className="lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-900">Müşteri Yorumları ({reviewSummary.count})</h3>
                <div className="mt-4">
                  {/* --- 3. REVIEWLIST'İ GÜNCELLEYİN --- */}
                  <ReviewList reviews={reviews} onReviewDeleted={handleReviewDeleted} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={closeLightbox}>
          <button className="absolute top-4 right-4 text-white text-5xl font-bold z-[52] hover:text-gray-300 transition-colors" aria-label="Galeriyi kapat" onClick={closeLightbox}>&times;</button>
          <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {images.length > 1 && (
              <button onClick={scrollPrev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-2 text-white z-[52] transition-colors" aria-label="Önceki görsel">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            <div className="relative w-full h-full max-w-5xl max-h-[90vh]">
              <Image src={images[selectedIndex]} alt={`Büyük resim ${product?.name} - ${selectedIndex + 1}`} fill sizes="100vw" className="object-contain" />
            </div>
            {images.length > 1 && (
              <button onClick={scrollNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-2 text-white z-[52] transition-colors" aria-label="Sonraki görsel">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
