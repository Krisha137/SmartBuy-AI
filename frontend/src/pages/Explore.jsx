import React, { useState, useEffect } from 'react';
import { getProducts, getBrands, getProductSegments } from '../api/products';
import ProductGrid from '../components/products/ProductGrid';
import FilterSidebar from '../components/products/FilterSidebar';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import ComparisonBar from '../components/comparison/ComparisonBar';
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Explore() {
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [brands, setBrands] = useState([]);
  const [segments, setSegments] = useState([]);
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    brand: '',
    min_price: '',
    max_price: '',
    min_ram: '',
    storage_type: '',
    gpu_type: '',
    product_segment: '',
    ordering: '-created_at',
  });

  useEffect(() => {
    getBrands().then(res => setBrands(res.brands || [])).catch(() => {});
    getProductSegments().then(res => setSegments(res.product_segments || [])).catch(() => {});
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const apiParams = {
      page: page,
      ordering: filters.ordering,
    };

    if (filters.brand) apiParams.brand = filters.brand;
    if (filters.min_price) apiParams.min_price = filters.min_price;
    if (filters.max_price) apiParams.max_price = filters.max_price;
    if (filters.min_ram) apiParams.min_ram = filters.min_ram;
    if (filters.storage_type) apiParams.storage_type = filters.storage_type;
    if (filters.gpu_type) apiParams.gpu_type = filters.gpu_type;
    if (filters.product_segment) apiParams.product_segment = filters.product_segment;

    getProducts(apiParams)
      .then((res) => {
        if (isMounted) {
          setProducts(res.results || []);
          setCount(res.count || 0);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to fetch catalog products.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [page, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      brand: '',
      min_price: '',
      max_price: '',
      min_ram: '',
      storage_type: '',
      gpu_type: '',
      product_segment: '',
      ordering: '-created_at',
    });
    setPage(1);
  };

  const totalPages = Math.ceil(count / 20);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E9E2E5] pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-[#29252A] flex items-center gap-2">
            Explore laptops <span className="text-[#6D214F] text-xl">✦</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6870] mt-1">
            Discover laptops selected from our product intelligence database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden px-3.5 py-2 bg-white border border-[#E9E2E5] text-[#29252A] text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#6D214F]" /> Filters
          </button>
          <div className="text-xs bg-[#FAF8F5] border border-[#E9E2E5] text-[#6F6870] px-3.5 py-2 rounded-xl font-medium">
            Total: <strong className="text-[#6D214F] font-bold">{count}</strong> laptops
          </div>
        </div>
      </div>

      {/* Main Grid & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Sidebar (Desktop) */}
        <div className="hidden lg:block lg:col-span-1 sticky top-20">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            brands={brands}
            segments={segments}
          />
        </div>

        {/* Sidebar Drawer (Mobile) */}
        {mobileFilterOpen && (
          <div className="lg:hidden col-span-1 mb-4">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              brands={brands}
              segments={segments}
            />
          </div>
        )}

        {/* Products Grid */}
        <div className="lg:col-span-3 space-y-6">
          
          {error ? (
            <ErrorState title="Catalog Fetch Error" message={error} onRetry={() => setPage(page)} />
          ) : !loading && products.length === 0 ? (
            <EmptyState
              title="No Laptops Matched Filters"
              message="No laptops in the database match all selected filter criteria. Try broadening your price range or resetting filters."
              actionText="Reset Filters"
              actionLink="#"
            />
          ) : (
            <>
              <ProductGrid products={products} loading={loading} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-[#E9E2E5] pt-6 text-xs">
                  <span className="text-[#6F6870] font-medium">
                    Page <strong className="text-[#29252A] font-bold">{page}</strong> of <strong className="text-[#29252A] font-bold">{totalPages}</strong>
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3.5 py-2 bg-white border border-[#E9E2E5] hover:bg-[#FAF8F5] disabled:opacity-50 text-[#29252A] font-bold rounded-xl transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </button>
                    
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="px-3.5 py-2 bg-[#6D214F] hover:bg-[#8B315F] disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

      </div>

      <ComparisonBar />

    </div>
  );
}
