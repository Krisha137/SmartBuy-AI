import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { smartSearch } from '../api/ai';
import { getProducts } from '../api/products';
import RequirementSummaryBadge from '../components/recommendations/RequirementSummaryBadge';
import ProductRecommendationCard from '../components/recommendations/ProductRecommendationCard';
import ProductCard from '../components/products/ProductCard';
import { SearchLoadingState } from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import ComparisonBar from '../components/comparison/ComparisonBar';
import { ArrowLeft, Search, SlidersHorizontal, ArrowUpDown, X, Sparkles, Laptop } from 'lucide-react';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [inputQuery, setInputQuery] = useState(query);
  const [loading, setLoading] = useState(true);
  const [smartData, setSmartData] = useState(null);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [error, setError] = useState(null);

  // Filters & Sorting
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedMinRam, setSelectedMinRam] = useState(0);
  const [selectedMaxPrice, setSelectedMaxPrice] = useState(0);

  // Sync input query if URL changes
  useEffect(() => {
    setInputQuery(query);
  }, [query]);

  // Execute Search
  useEffect(() => {
    if (!query.trim()) {
      setLoading(false);
      setSmartData(null);
      setCatalogProducts([]);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    // 1. Prepare catalog search parameters
    const catalogParams = {
      search: query.trim(),
      page_size: 50,
    };

    if (sortBy === 'price_asc') catalogParams.ordering = 'price';
    else if (sortBy === 'price_desc') catalogParams.ordering = '-price';
    else if (sortBy === 'rating_desc') catalogParams.ordering = '-rating';

    if (selectedBrand !== 'All') catalogParams.brand = selectedBrand;
    if (selectedMinRam > 0) catalogParams.min_ram = selectedMinRam;
    if (selectedMaxPrice > 0) catalogParams.max_price = selectedMaxPrice;

    // 2. Concurrently execute smartSearch (AI pipeline) & getProducts (PostgreSQL direct search)
    Promise.allSettled([
      smartSearch(query.trim()),
      getProducts(catalogParams),
    ])
      .then(([smartResult, catalogResult]) => {
        if (!isMounted) return;

        if (smartResult.status === 'fulfilled') {
          setSmartData(smartResult.value);
        } else {
          setSmartData(null);
        }

        if (catalogResult.status === 'fulfilled') {
          const raw = catalogResult.value;
          const list = raw.results || raw || [];
          setCatalogProducts(list);
        } else {
          setCatalogProducts([]);
        }

        setLoading(false);
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to process search query.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [query, sortBy, selectedBrand, selectedMinRam, selectedMaxPrice]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputQuery.trim()) {
      setSearchParams({ q: inputQuery.trim() });
    } else {
      navigate('/explore');
    }
  };

  const clearFilters = () => {
    setSelectedBrand('All');
    setSelectedMinRam(0);
    setSelectedMaxPrice(0);
    setSortBy('relevance');
  };

  if (!query.trim()) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="No search query provided"
          message="Enter laptop names, specs (e.g. 16GB, RTX 4060, i7), brands, or workflows to discover laptops."
          actionText="Go to Catalog"
          actionLink="/explore"
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <SearchLoadingState message="SmartBuy AI is matching specs and searching PostgreSQL..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ErrorState
          title="Search Encountered an Issue"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const aiRecommendations = smartData?.recommendation?.recommendations || [];
  const requirement = smartData?.understanding || smartData?.requirement;

  // Filter catalog products that are already in AI recommendations to avoid duplication
  const aiProductIds = new Set(aiRecommendations.map((r) => r.product_id || r.product?.product_id));
  const additionalCatalogProducts = catalogProducts.filter((p) => !aiProductIds.has(p.product_id));

  const totalResultsCount = aiRecommendations.length + additionalCatalogProducts.length;
  const hasActiveFilters = selectedBrand !== 'All' || selectedMinRam > 0 || selectedMaxPrice > 0 || sortBy !== 'relevance';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 animate-fadeIn">
      {/* Search Header Bar with Input and Submit */}
      <div className="bg-white rounded-3xl border border-[#E9E2E5] p-5 sm:p-6 shadow-premium space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E9E2E5] pb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6D214F] hover:underline transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <div className="text-xs bg-[#FAF8F5] border border-[#E9E2E5] text-[#6F6870] px-3.5 py-1.5 rounded-full font-medium">
            Found <strong className="text-[#6D214F] font-bold">{totalResultsCount}</strong> laptops in catalog
          </div>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Search by brand, specs (16GB, RTX 4060, i7), or purpose..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm bg-[#FAF8F5] border border-[#E9E2E5] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#6D214F] focus:bg-white transition-all text-[#29252A] placeholder:text-[#989198]"
            />
            <Search className="w-4 h-4 text-[#989198] absolute left-3.5 top-3.5 pointer-events-none" />
            {inputQuery && (
              <button
                type="button"
                onClick={() => setInputQuery('')}
                className="absolute right-3 top-3 text-[#989198] hover:text-[#29252A]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-[#6D214F] hover:bg-[#8B315F] text-white text-xs sm:text-sm font-bold rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0 active:scale-98"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </form>

        {/* Filter and Sort Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#989198] font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider">
              <SlidersHorizontal className="w-3 h-3" /> Filter:
            </span>

            {/* Brand Filter */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-2.5 py-1.5 bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl text-xs font-semibold text-[#29252A] focus:outline-none focus:ring-1 focus:ring-[#6D214F]"
            >
              <option value="All">All Brands</option>
              <option value="Dell">Dell</option>
              <option value="HP">HP</option>
              <option value="Apple">Apple</option>
              <option value="Lenovo">Lenovo</option>
              <option value="ASUS">ASUS</option>
              <option value="Acer">Acer</option>
            </select>

            {/* RAM Filter */}
            <select
              value={selectedMinRam}
              onChange={(e) => setSelectedMinRam(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl text-xs font-semibold text-[#29252A] focus:outline-none focus:ring-1 focus:ring-[#6D214F]"
            >
              <option value={0}>Any RAM</option>
              <option value={8}>8GB+ RAM</option>
              <option value={16}>16GB+ RAM</option>
              <option value={32}>32GB+ RAM</option>
            </select>

            {/* Max Budget Filter */}
            <select
              value={selectedMaxPrice}
              onChange={(e) => setSelectedMaxPrice(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl text-xs font-semibold text-[#29252A] focus:outline-none focus:ring-1 focus:ring-[#6D214F]"
            >
              <option value={0}>Any Budget</option>
              <option value={60000}>Under ₹60,000</option>
              <option value={80000}>Under ₹80,000</option>
              <option value={120000}>Under ₹1,20,000</option>
              <option value={200000}>Under ₹2,00,000</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-[#6D214F] hover:underline flex items-center gap-1 cursor-pointer ml-1"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <span className="text-[#989198] font-bold flex items-center gap-1 text-[11px] uppercase tracking-wider">
              <ArrowUpDown className="w-3 h-3" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl text-xs font-bold text-[#6D214F] focus:outline-none focus:ring-1 focus:ring-[#6D214F]"
            >
              <option value="relevance">AI Match / Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requirement Summary */}
      {requirement && (
        <RequirementSummaryBadge requirement={requirement} />
      )}

      {/* 1. AI Curated Recommendations (if available) */}
      {aiRecommendations.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#E9E2E5] pb-3">
            <h2 className="text-xl font-extrabold text-[#29252A] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#6D214F]" />
              <span>AI Ranked Recommendations</span>
            </h2>
            <span className="text-xs text-[#6F6870] font-semibold">
              {aiRecommendations.length} top candidates evaluated
            </span>
          </div>

          <div className="space-y-5">
            {aiRecommendations.map((item, idx) => (
              <ProductRecommendationCard key={item.product_id || idx} recommendation={item} />
            ))}
          </div>
        </div>
      )}

      {/* 2. Direct Matching Catalog Products */}
      {additionalCatalogProducts.length > 0 && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-[#E9E2E5] pb-3">
            <h2 className="text-xl font-extrabold text-[#29252A] flex items-center gap-2">
              <Laptop className="w-5 h-5 text-[#6D214F]" />
              <span>
                {aiRecommendations.length > 0 ? 'More Matching Laptops from Catalog' : 'Matching Laptops'}
              </span>
            </h2>
            <span className="text-xs text-[#6F6870] font-semibold">
              {additionalCatalogProducts.length} models found
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {additionalCatalogProducts.map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* 3. Empty State if 0 AI results and 0 Catalog results */}
      {totalResultsCount === 0 && (
        <EmptyState
          title="No Matching Laptops Found"
          message={`No products matched "${query}" with your current filter settings. Try relaxing filters or searching by brand or spec.`}
          actionText="Explore Full Catalog"
          actionLink="/explore"
        />
      )}

      {/* Sticky Bottom Comparison Bar */}
      <ComparisonBar />
    </div>
  );
}
