import React, { useState, useEffect } from 'react';
import { ThumbsUp, AlertCircle, ShieldCheck, Star, Search, Quote, CheckCircle2, Info, RefreshCw } from 'lucide-react';
import { formatRating, formatPercentage } from '../../utils/formatters';
import apiClient from '../../api/client';

export default function ReviewIntelligenceCard({ intelligence, productId }) {
  if (!intelligence) return null;

  const stats = intelligence.review_statistics || {};
  const sentiment = intelligence.sentiment || { positive: 0, neutral: 0, negative: 0 };
  const positiveThemes = intelligence.positive_themes || [];
  const negativeThemes = intelligence.negative_themes || [];

  // Combine unique themes present for this product
  const allThemesMap = {};
  positiveThemes.forEach((t) => {
    allThemesMap[t.theme] = {
      theme: t.theme,
      posMentions: t.mention_count,
      negMentions: 0,
      total: t.mention_count,
    };
  });
  negativeThemes.forEach((t) => {
    if (allThemesMap[t.theme]) {
      allThemesMap[t.theme].negMentions = t.mention_count;
      allThemesMap[t.theme].total += t.mention_count;
    } else {
      allThemesMap[t.theme] = {
        theme: t.theme,
        posMentions: 0,
        negMentions: t.mention_count,
        total: t.mention_count,
      };
    }
  });

  const availableThemes = Object.values(allThemesMap).sort((a, b) => b.total - a.total);

  const [activeTheme, setActiveTheme] = useState(availableThemes[0]?.theme || null);
  const [themeReviews, setThemeReviews] = useState([]);
  const [loadingEvidence, setLoadingEvidence] = useState(false);

  // Fetch real review citations for selected theme
  useEffect(() => {
    if (!activeTheme || !productId) return;

    let isMounted = true;
    setLoadingEvidence(true);

    apiClient
      .get(`/products/${productId}/reviews/`, { params: { theme: activeTheme } })
      .then((res) => {
        if (isMounted) {
          const list = res.data?.results || res.data || [];
          setThemeReviews(list);
          setLoadingEvidence(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load theme reviews:', err);
        if (isMounted) setLoadingEvidence(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTheme, productId]);

  const selectedThemeData = allThemesMap[activeTheme] || null;

  return (
    <div className="bg-white rounded-3xl border border-[#E9E2E5] p-6 sm:p-8 shadow-premium space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E9E2E5] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F7E8EE] text-[#6D214F] flex items-center justify-center font-bold text-lg shadow-xs">
            ✦
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6D214F] bg-[#F7E8EE] px-2.5 py-0.5 rounded-full">
                Review Truth Lens
              </span>
            </div>
            <h3 className="font-black text-[#29252A] text-lg sm:text-xl mt-1">
              What Real Customer Reviews Actually Indicate
            </h3>
            <span className="text-xs text-[#6F6870]">
              Separating genuine feedback from marketing claims using stored NLP theme extraction
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full border border-[#E9E2E5] bg-[#FAF8F5] text-[#6D214F] capitalize">
            Evidence Confidence: {intelligence.confidence || 'Medium'}
          </span>
          {stats.verified_review_percentage && (
            <span className="text-xs bg-[#F7E8EE] text-[#6D214F] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#6D214F]" />
              {stats.verified_review_percentage}% Verified
            </span>
          )}
        </div>
      </div>

      {/* Summary Box */}
      {intelligence.summary && (
        <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E9E2E5] text-xs sm:text-sm text-[#29252A] leading-relaxed italic">
          "{intelligence.summary}"
        </div>
      )}

      {/* Sentiment Breakdown Progress Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-[#29252A]">
          <span>Verified Review Sentiment ({stats.total_reviews || 0} Total Reviews)</span>
          <div className="flex items-center gap-1 text-[#C9A227] font-bold">
            <Star className="w-3.5 h-3.5 fill-[#C9A227]" />
            <span>{formatRating(stats.average_rating)} ★ Average</span>
          </div>
        </div>

        <div className="w-full h-3 bg-[#F6F1F3] rounded-full overflow-hidden flex">
          <div
            style={{ width: `${sentiment.positive || 0}%` }}
            className="bg-[#6D214F] h-full transition-all"
            title={`Positive: ${sentiment.positive}%`}
          />
          <div
            style={{ width: `${sentiment.neutral || 0}%` }}
            className="bg-[#989198] h-full transition-all"
            title={`Neutral: ${sentiment.neutral}%`}
          />
          <div
            style={{ width: `${sentiment.negative || 0}%` }}
            className="bg-[#A85578] h-full transition-all"
            title={`Negative: ${sentiment.negative}%`}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-[#6F6870] font-medium pt-0.5">
          <span className="text-[#6D214F] font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6D214F] inline-block"></span>
            Positive: {formatPercentage(sentiment.positive)}
          </span>
          <span className="text-[#6F6870] flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#989198] inline-block"></span>
            Neutral: {formatPercentage(sentiment.neutral)}
          </span>
          <span className="text-[#A85578] font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A85578] inline-block"></span>
            Negative: {formatPercentage(sentiment.negative)}
          </span>
        </div>
      </div>

      {/* INTERACTIVE THEME FILTERS */}
      <div className="pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6D214F]">
            Interactive Review Themes (Click to Inspect Evidence)
          </span>
          <span className="text-[11px] text-[#6F6870]">
            {availableThemes.length} Supported Themes
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {availableThemes.map((t) => {
            const isSelected = activeTheme === t.theme;
            return (
              <button
                key={t.theme}
                onClick={() => setActiveTheme(t.theme)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#6D214F] text-white shadow-md'
                    : 'bg-[#FAF8F5] text-[#29252A] border border-[#E9E2E5] hover:border-[#6D214F]/40 hover:bg-[#F7E8EE]'
                }`}
              >
                <span>{t.theme}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#E9E2E5] text-[#6F6870]'
                  }`}
                >
                  {t.total}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SELECTED THEME DEEP-DIVE & REAL REVIEW EVIDENCE */}
      {selectedThemeData && (
        <div className="bg-[#FAF8F5] rounded-2xl border border-[#E9E2E5] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E9E2E5] pb-3">
            <div>
              <h4 className="font-black text-[#29252A] text-base">
                Theme Analysis: {selectedThemeData.theme}
              </h4>
              <p className="text-xs text-[#6F6870] mt-0.5">
                Found across {selectedThemeData.total} review mentions for this model.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {selectedThemeData.posMentions > 0 && (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" /> {selectedThemeData.posMentions} Praise
                </span>
              )}
              {selectedThemeData.negMentions > 0 && (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {selectedThemeData.negMentions} Concerns
                </span>
              )}
            </div>
          </div>

          {/* Honest Disclosure of Evidence Scope */}
          <div className="text-xs text-[#6F6870] space-y-1">
            <div className="font-semibold text-[#29252A] flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#6D214F]" /> What this evidence establishes:
            </div>
            {selectedThemeData.total <= 2 ? (
              <p className="italic bg-white p-2.5 rounded-xl border border-[#E9E2E5]">
                Limited information: Only {selectedThemeData.total} reviews specifically discuss {selectedThemeData.theme.toLowerCase()}. Findings may not represent all user environments.
              </p>
            ) : (
              <p className="bg-white p-2.5 rounded-xl border border-[#E9E2E5]">
                Verified customer reviews discuss {selectedThemeData.theme.toLowerCase()} under daily use.
                {selectedThemeData.negMentions > 0
                  ? ` Feedback is mixed: ${selectedThemeData.posMentions} customers were satisfied, while ${selectedThemeData.negMentions} noted drawbacks.`
                  : ` Feedback is consistently favorable with ${selectedThemeData.posMentions} positive mentions.`}
              </p>
            )}
          </div>

          {/* Actual Review Text Evidence */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold text-[#6D214F] uppercase tracking-wider block">
              Actual Customer Review Quotes ({selectedThemeData.theme})
            </span>

            {loadingEvidence ? (
              <div className="p-4 text-center text-xs text-[#6F6870] flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#6D214F]" />
                <span>Loading real review quotes...</span>
              </div>
            ) : themeReviews.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {themeReviews.slice(0, 3).map((rev) => (
                  <div
                    key={rev.review_id}
                    className="bg-white p-3 rounded-xl border border-[#E9E2E5] space-y-1 shadow-xs text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1 text-[#C9A227] font-bold">
                        <Star className="w-3 h-3 fill-[#C9A227]" />
                        <span>{formatRating(rev.rating)} ★</span>
                        {rev.verified_purchase && (
                          <span className="text-emerald-700 ml-1 font-semibold">• Verified Purchase</span>
                        )}
                      </div>
                      <span className="text-[#989198]">{rev.review_date || 'Recent review'}</span>
                    </div>
                    {rev.review_title && (
                      <h6 className="font-bold text-[#29252A] text-xs">{rev.review_title}</h6>
                    )}
                    <p className="text-[#6F6870] leading-relaxed italic">
                      "{rev.review_text}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#6F6870] italic">
                No individual review quotes matched the filter.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
