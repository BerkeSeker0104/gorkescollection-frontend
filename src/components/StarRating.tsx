// src/components/StarRating.tsx
import { Star } from 'lucide-react';
import clsx from 'clsx';

interface StarRatingProps {
  rating: number;
  className?: string;
  starSize?: number;
}

const StarRating = ({ rating, className, starSize = 16 }: StarRatingProps) => {
  return (
    <div className={clsx('flex items-center gap-0.5', className)}>
      {[...Array(5)].map((_, index) => {
        const starRating = Math.round(rating * 2) / 2; // Puanı 0.5'lik adımlara yuvarla
        const isFilled = index + 0.5 <= starRating;

        return (
          <Star
            key={index}
            size={starSize}
            className={clsx('transition-colors', {
              'text-yellow-400 fill-yellow-400': isFilled,
              'text-gray-300': !isFilled,
            })}
          />
        );
      })}
    </div>
  );
};

export default StarRating;