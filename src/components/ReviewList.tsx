// src/components/ReviewList.tsx
'use client';

import { Review } from '@/types';
import StarRating from './StarRating';

interface ReviewListProps {
  reviews: Review[];
}

const ReviewList = ({ reviews }: ReviewListProps) => {
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
              <p className="ml-auto text-xs text-gray-500">
                {new Date(review.createdAtUtc).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <p className="mt-4 text-sm text-gray-600 whitespace-pre-wrap">{review.comment}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;