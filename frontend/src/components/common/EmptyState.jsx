import React from 'react';
import { PackageOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({ 
  title = "No products found", 
  message = "No items matched your specified criteria. Try relaxing your filters or increasing your budget.",
  actionText,
  actionLink
}) {
  return (
    <div className="my-12 p-8 sm:p-10 bg-white border border-[#E9E2E5] rounded-3xl text-center space-y-4 max-w-md mx-auto shadow-premium animate-fadeIn">
      <div className="w-16 h-16 bg-[#F7E8EE] text-[#6D214F] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
        <PackageOpen className="w-8 h-8" />
      </div>
      <div className="space-y-1.5">
        <h3 className="font-extrabold text-[#29252A] text-xl">{title}</h3>
        <p className="text-xs sm:text-sm text-[#6F6870] leading-relaxed">{message}</p>
      </div>
      {actionLink && actionText && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6D214F] text-white text-xs font-bold rounded-xl hover:bg-[#8B315F] transition-all shadow-md active:scale-95"
        >
          {actionText} <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
