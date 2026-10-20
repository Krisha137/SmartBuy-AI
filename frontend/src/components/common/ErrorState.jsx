import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <div className="my-8 p-6 bg-[#F7E8EE] border border-[#A85578]/30 rounded-2xl text-center space-y-3 max-w-lg mx-auto shadow-premium animate-fadeIn">
      <div className="w-12 h-12 bg-white text-[#6D214F] rounded-full flex items-center justify-center mx-auto shadow-xs">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="font-extrabold text-[#6D214F] text-base">{title}</h3>
      <p className="text-xs sm:text-sm text-[#29252A] leading-relaxed">
        {message || "We encountered an error processing your request. Please try again."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#6D214F] text-white text-xs font-bold rounded-xl hover:bg-[#8B315F] transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Action
        </button>
      )}
    </div>
  );
}
