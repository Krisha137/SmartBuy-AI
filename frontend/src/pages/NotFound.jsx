import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto my-20 p-8 sm:p-10 bg-white border border-[#E9E2E5] rounded-3xl text-center space-y-4 shadow-premium animate-fadeIn">
      <div className="w-16 h-16 bg-[#F7E8EE] text-[#6D214F] rounded-2xl flex items-center justify-center mx-auto shadow-xs font-bold text-xl">
        ✦ 404
      </div>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#29252A]">Page Not Found</h1>
      <p className="text-xs sm:text-sm text-[#6F6870] leading-relaxed">
        The page or route you are looking for does not exist in SmartBuy AI.
      </p>
      <div className="flex items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="px-5 py-2.5 bg-[#6D214F] hover:bg-[#8B315F] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95"
        >
          <Home className="w-3.5 h-3.5" /> Go to Home
        </Link>
        <Link
          to="/explore"
          className="px-5 py-2.5 bg-[#FAF8F5] hover:bg-[#F6F1F3] border border-[#E9E2E5] text-[#29252A] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
        >
          <Compass className="w-3.5 h-3.5 text-[#6D214F]" /> Explore Catalog
        </Link>
      </div>
    </div>
  );
}
