import React, { useState } from 'react';
import { askProduct } from '../../api/ai';
import SuggestedQuestions from './SuggestedQuestions';
import { Send, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

export default function AskLaptopPanel({ productId, productName }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (qToSubmit = null) => {
    const targetQ = typeof qToSubmit === 'string' ? qToSubmit : question;
    if (!targetQ || !targetQ.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await askProduct(productId, targetQ.trim());
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to get an answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggested = (suggestedQ) => {
    setQuestion(suggestedQ);
    handleSubmit(suggestedQ);
  };

  return (
    <div className="bg-[#F2ECF7] border-2 border-[#6D214F]/30 rounded-2xl p-6 sm:p-8 shadow-plum-glow space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#E9E2E5] pb-4">
        <div className="w-11 h-11 rounded-xl bg-[#6D214F] text-white flex items-center justify-center font-bold text-lg shadow-sm">
          ✦
        </div>
        <div>
          <h3 className="font-extrabold text-xl text-[#29252A] flex items-center gap-2">
            Ask SmartBuy Intelligence
          </h3>
          <p className="text-xs text-[#6F6870]">
            Get factual answers grounded in database specifications and precomputed review intelligence.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder={`Ask a question about ${productName || 'this laptop'} (e.g., Is it good for programming?)...`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            maxLength={500}
            className="w-full pl-4 pr-28 py-4 bg-white border border-[#E9E2E5] rounded-xl text-sm text-[#29252A] placeholder:text-[#989198] focus:outline-none focus:ring-2 focus:ring-[#6D214F] shadow-xs transition-all"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="absolute right-2 px-4 py-2.5 bg-[#6D214F] hover:bg-[#8B315F] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Thinking...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" /> Ask AI
              </>
            )}
          </button>
        </div>

        {/* Suggested Questions */}
        <SuggestedQuestions onSelectQuestion={handleSelectSuggested} />
      </form>

      {/* Error Callout */}
      {error && (
        <div className="p-4 bg-[#F7E8EE] border border-[#A85578]/30 rounded-xl text-xs text-[#6D214F] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#A85578] shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Result Conversational Card */}
      {result && (
        <div className="bg-white border border-[#E9E2E5] rounded-2xl p-6 space-y-4 shadow-premium animate-fadeIn">
          
          <div className="flex items-center justify-between border-b border-[#E9E2E5] pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6D214F] flex items-center gap-1">
              <span>✦</span> AI Answer Breakdown
            </span>
            {result.confidence && (
              <span className="text-[11px] font-bold px-3 py-1 rounded-full border bg-[#FAF8F5] border-[#E9E2E5] text-[#6D214F] capitalize">
                Confidence: {result.confidence}
              </span>
            )}
          </div>

          {/* Question & Direct Answer */}
          <div className="space-y-2">
            <div className="text-xs text-[#6F6870] font-medium">Question: "{result.question}"</div>
            
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E9E2E5] space-y-2">
              <div className="text-xs font-bold uppercase text-[#6D214F] tracking-wider">Direct Answer</div>
              <p className="text-sm font-semibold text-[#29252A] leading-relaxed">
                {result.answer}
              </p>
            </div>
          </div>

          {/* Grounded Evidence Metadata */}
          {result.evidence && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              
              {/* Product Specs Evidence */}
              {result.evidence.product_facts && result.evidence.product_facts.length > 0 && (
                <div className="bg-[#F7E8EE]/60 p-3.5 rounded-xl border border-[#E9E2E5] space-y-1.5">
                  <h5 className="font-bold text-[#6D214F] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#6D214F]" /> Verified Database Facts
                  </h5>
                  <ul className="space-y-1 text-[#29252A]">
                    {result.evidence.product_facts.map((fact, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-[#6D214F] font-bold">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Review Intelligence Evidence */}
              {result.evidence.review_insights && result.evidence.review_insights.length > 0 && (
                <div className="bg-[#F2ECF7]/60 p-3.5 rounded-xl border border-[#E9E2E5] space-y-1.5">
                  <h5 className="font-bold text-[#29252A] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#6D214F]" /> Customer Review Evidence
                  </h5>
                  <ul className="space-y-1 text-[#29252A]">
                    {result.evidence.review_insights.map((ins, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-[#6D214F] font-bold">•</span>
                        <span>{ins}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}
