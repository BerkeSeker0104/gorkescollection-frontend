// src/components/ReviewForm.tsx
'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star, Loader2 } from 'lucide-react';
// import { postReview } from '@/lib/api'; // NOT: Bu iterasyonda doğrudan fetch kullanıyoruz.
import { Review } from '@/types';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Lütfen en az 1 yıldız seçin.'),
  comment: z.string().max(2000, 'Yorumunuz en fazla 2000 karakter olabilir.').optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  productId: number;
  onReviewSubmitted: (newReview: Review) => void;
}

export default function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' },
  });

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    try {
      // TOKEN'I LOCALSTORAGE'DAN AL
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      // Token yoksa backend 401 dönecektir; kullanıcıyı erken bilgilendir.
      if (!token) {
        toast.error('Yorum göndermek için lütfen giriş yapın.');
        return;
      }

      // FETCH: Authorization header ile gönder, cookie/credentials kullanma
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/${String(productId)}/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (res.status === 401) {
        toast.error('Yorum göndermek için lütfen giriş yapın.');
        return;
      }

      if (!res.ok) {
        const msg = await safeErrorMessage(res);
        throw new Error(msg || 'Yorum gönderilirken bir sorun oluştu.');
      }

      const newReview = (await res.json()) as Review;
      toast.success('Yorumunuz için teşekkür ederiz!');
      onReviewSubmitted(newReview);
      reset();
    } catch (error: any) {
      toast.error(error?.message || 'Yorum gönderilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Yardımcı: backend'ten dönen hata mesajını güvenle çek
  const safeErrorMessage = async (res: Response) => {
    try {
      const text = await res.text();
      if (!text) return '';
      // JSON ise parse etmeye çalış
      try {
        const j = JSON.parse(text);
        return j?.message || j?.error || '';
      } catch {
        return text;
      }
    } catch {
      return '';
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Puanınız</label>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={28}
                  className={clsx('cursor-pointer transition-colors', {
                    'text-yellow-400 fill-yellow-400': star <= (hoverRating || field.value),
                    'text-gray-300': star > (hoverRating || field.value),
                  })}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => field.onChange(star)}
                />
              ))}
            </div>
          )}
        />
        {errors.rating && <p className="mt-1 text-sm text-red-600">{errors.rating.message}</p>}
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
          Yorumunuz (opsiyonel)
        </label>
        <div className="mt-1">
          <Controller
            name="comment"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                id="comment"
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Ürün hakkındaki düşüncelerinizi paylaşın..."
              />
            )}
          />
        </div>
        {errors.comment && <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>}
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}
        </button>
      </div>
    </form>
  );
}