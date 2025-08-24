'use client';

import { Review } from '@/types';
import StarRating from './StarRating';
import { useAuth } from '@/context/AuthContext'; // Giriş yapmış kullanıcıyı kontrol etmek için
import { deleteReview } from '@/lib/api';      // Yeni API fonksiyonumuz
import { Trash2 } from 'lucide-react';         // Silme ikonu
import { useState } from 'react';               // Silme durumunu yönetmek için

// 1. Component'in alacağı prop'lar güncellendi
interface ReviewListProps {
  reviews: Review[];
  onReviewDeleted: (reviewId: number) => void; // Yorum silindiğinde ana sayfaya haber verecek fonksiyon
}

const ReviewList = ({ reviews, onReviewDeleted }: ReviewListProps) => {
  // 2. Gerekli hook'lar ve state'ler tanımlandı
  const { user } = useAuth(); // Giriş yapmış kullanıcı bilgisi
  const [deletingId, setDeletingId] = useState<number | null>(null); // Hangi yorumun silindiğini takip eder

  // 3. Yorum silme mantığı eklendi
  const handleDelete = async (reviewId: number) => {
    // Kullanıcıdan onay al
    if (window.confirm('Yorumunuzu silmek istediğinizden emin misiniz?')) {
      setDeletingId(reviewId); // Silme işlemini başlat, butonu kilitle
      const success = await deleteReview(reviewId);
      
      if (success) {
        onReviewDeleted(reviewId); // Başarılı olursa, ana sayfadaki listeyi güncelle
      } else {
        alert('Yorum silinirken bir hata oluştu.');
      }
      setDeletingId(null); // Silme işlemini bitir
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Bu ürüne henüz yorum yapılmamış.</p>
        <p className="text-sm">İlk yorumu yapan siz olun!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {reviews.map((review) => (
        <div key={review.id} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-shrink-0 text-center sm:w-40">
            <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600 text-xl">
              {review.authorUsername.charAt(0).toUpperCase()}
            </div>
            <p className="mt-2 text-sm font-semibold text-gray-800">{review.authorUsername}</p>
          </div>
          <div className="flex-1 border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-6">
            <div className="flex items-center">
              <StarRating rating={review.rating} />
              {/* 4. Tarih ve Sil butonu için yeni bir kapsayıcı eklendi */}
              <div className="ml-auto flex items-center gap-4">
                <p className="text-xs text-gray-500">
                  {new Date(review.createdAtUtc).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>

                {/* 5. Sil butonu, sadece yorumun sahibine gösterilir */}
                {user?.username === review.authorUsername && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id}
                    className="text-gray-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                    aria-label="Yorumu sil"
                  >
                    {deletingId === review.id ? (
                      <span className="text-xs animate-pulse">Siliniyor...</span>
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                )}
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600 whitespace-pre-wrap">{review.comment}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
