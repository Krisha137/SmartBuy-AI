import React from 'react';
import { Star, ThumbsUp, ShieldCheck } from 'lucide-react';
import { formatRating } from '../../utils/formatters';

export function ReviewCard({ review }) {
  if (!review) return null;

  return (
    <div className="bg-white rounded-2xl border border-[#E9E2E5] p-4.5 space-y-2.5 shadow-premium">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-[#FAF5E8] text-[#C9A227] px-2.5 py-0.5 rounded-full text-xs font-bold border border-[#E9E2E5]">
          <Star className="w-3.5 h-3.5 fill-[#C9A227]" />
          <span>{formatRating(review.rating)} / 5.0</span>
        </div>

        {review.verified_purchase && (
          <span className="text-[11px] text-[#6D214F] bg-[#F7E8EE] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-[#E9E2E5]">
            <ShieldCheck className="w-3 h-3 text-[#6D214F]" /> Verified Purchase
          </span>
        )}
      </div>

      {review.review_title && (
        <h4 className="font-bold text-[#29252A] text-sm">{review.review_title}</h4>
      )}

      <p className="text-xs sm:text-sm text-[#29252A] leading-relaxed">
        {review.review_text}
      </p>

      <div className="flex items-center justify-between text-[11px] text-[#989198] pt-2 border-t border-[#E9E2E5]">
        <span>{review.review_date || 'Recent review'}</span>
        {review.helpful_votes > 0 && (
          <span className="flex items-center gap-1 text-[#6F6870] font-medium">
            <ThumbsUp className="w-3 h-3 text-[#6D214F]" /> {review.helpful_votes} found helpful
          </span>
        )}
      </div>
    </div>
  );
}

export function ReviewList({ reviews = [] }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="p-6 text-center text-[#6F6870] text-xs bg-[#FAF8F5] rounded-2xl border border-[#E9E2E5]">
        No individual customer review entries recorded for this product yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((rev) => (
        <ReviewCard key={rev.review_id || rev.id} review={rev} />
      ))}
    </div>
  );
}
