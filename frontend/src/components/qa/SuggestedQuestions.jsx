import React from 'react';
import { HelpCircle } from 'lucide-react';

const SPECIFIED_SUGGESTIONS = [
  "Is this good for college?",
  "How is the battery?",
  "Is it good for programming?",
  "Would you recommend it for gaming?",
  "Is it worth the price?"
];

export default function SuggestedQuestions({ onSelectQuestion }) {
  return (
    <div className="space-y-2">
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D214F] flex items-center gap-1">
        <HelpCircle className="w-3.5 h-3.5 text-[#6D214F]" /> Suggested Questions
      </span>
      <div className="flex flex-wrap gap-2">
        {SPECIFIED_SUGGESTIONS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectQuestion(q)}
            className="text-xs bg-white hover:bg-[#F7E8EE] border border-[#E9E2E5] hover:border-[#6D214F]/40 text-[#6D214F] font-semibold px-3 py-1.5 rounded-xl transition-all shadow-xs text-left cursor-pointer"
          >
            "{q}"
          </button>
        ))}
      </div>
    </div>
  );
}
