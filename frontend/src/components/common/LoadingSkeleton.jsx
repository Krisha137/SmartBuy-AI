import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E9E2E5] p-5 shadow-premium animate-pulse flex flex-col justify-between">
      <div className="space-y-3">
        <div className="w-full h-40 bg-[#F6F1F3] rounded-xl"></div>
        <div className="h-4 bg-[#FAF8F5] rounded w-1/4"></div>
        <div className="h-6 bg-[#FAF8F5] rounded w-3/4"></div>
        <div className="h-5 bg-[#FAF8F5] rounded w-1/3"></div>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="h-4 bg-[#FAF8F5] rounded"></div>
          <div className="h-4 bg-[#FAF8F5] rounded"></div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-[#E9E2E5] flex gap-2">
        <div className="h-9 bg-[#F6F1F3] rounded-xl flex-1"></div>
        <div className="h-9 bg-[#F6F1F3] rounded-xl w-10"></div>
      </div>
    </div>
  );
}

export function RecommendationCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#E9E2E5] p-6 shadow-premium animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-6 bg-[#F6F1F3] rounded-full w-24"></div>
        <div className="h-6 bg-[#F6F1F3] rounded-full w-20"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-44 bg-[#F6F1F3] rounded-xl"></div>
        <div className="md:col-span-2 space-y-3">
          <div className="h-4 bg-[#FAF8F5] rounded w-1/4"></div>
          <div className="h-7 bg-[#FAF8F5] rounded w-3/4"></div>
          <div className="h-6 bg-[#FAF8F5] rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
}

export function DetailsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-8">
      <div className="h-8 bg-[#F6F1F3] rounded-xl w-1/3"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-80 bg-[#F6F1F3] rounded-2xl"></div>
        <div className="space-y-4">
          <div className="h-6 bg-[#FAF8F5] rounded w-1/4"></div>
          <div className="h-10 bg-[#FAF8F5] rounded w-3/4"></div>
          <div className="h-8 bg-[#FAF8F5] rounded w-1/3"></div>
          <div className="h-24 bg-[#F6F1F3] rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

export function SearchLoadingState({ message }) {
  return (
    <div className="my-12 p-8 sm:p-10 text-center bg-white rounded-3xl border border-[#E9E2E5] shadow-premium space-y-4 max-w-xl mx-auto animate-fadeIn">
      <div className="relative w-16 h-16 mx-auto">
        <div className="absolute inset-0 rounded-full border-4 border-[#F7E8EE] animate-ping"></div>
        <div className="relative w-16 h-16 rounded-full border-4 border-[#6D214F] border-t-transparent animate-spin"></div>
      </div>
      <h3 className="text-xl font-extrabold text-[#29252A]">✦ SmartBuy Intelligence Analyzing</h3>
      <p className="text-xs sm:text-sm text-[#6F6870] animate-pulse">
        {message || "Evaluating database specifications, fit scores, and customer review intelligence..."}
      </p>
    </div>
  );
}
