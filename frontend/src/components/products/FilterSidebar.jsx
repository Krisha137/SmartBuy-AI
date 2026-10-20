import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export default function FilterSidebar({ 
  filters, 
  onFilterChange, 
  onResetFilters,
  brands = [],
  segments = []
}) {
  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <aside className="bg-white rounded-2xl border border-[#E9E2E5] p-5 shadow-premium space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E9E2E5] pb-3">
        <h3 className="font-bold text-[#29252A] text-sm flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#6D214F]" /> Catalog Filters
        </h3>
        <button
          onClick={onResetFilters}
          className="text-xs text-[#6D214F] hover:text-[#8B315F] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Brand Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#29252A] uppercase tracking-wider block">Brand</label>
        <select
          value={filters.brand || ''}
          onChange={(e) => handleChange('brand', e.target.value)}
          className="w-full text-xs bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl p-2.5 focus:ring-2 focus:ring-[#6D214F] focus:bg-white text-[#29252A]"
        >
          <option value="">All Brands</option>
          {brands.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* Price Range Filter (INR) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#29252A] uppercase tracking-wider block">Price Range (₹ INR)</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-[#989198] font-medium block mb-0.5">Min Price</span>
            <input
              type="number"
              placeholder="e.g. 40000"
              value={filters.min_price || ''}
              onChange={(e) => handleChange('min_price', e.target.value)}
              className="w-full text-xs bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl p-2.5 focus:ring-2 focus:ring-[#6D214F] focus:bg-white text-[#29252A]"
            />
          </div>
          <div>
            <span className="text-[10px] text-[#989198] font-medium block mb-0.5">Max Price</span>
            <input
              type="number"
              placeholder="e.g. 100000"
              value={filters.max_price || ''}
              onChange={(e) => handleChange('max_price', e.target.value)}
              className="w-full text-xs bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl p-2.5 focus:ring-2 focus:ring-[#6D214F] focus:bg-white text-[#29252A]"
            />
          </div>
        </div>
      </div>

      {/* Minimum RAM Filter */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#29252A] uppercase tracking-wider block">Minimum RAM</label>
        <div className="flex flex-wrap gap-1.5">
          {['', '8', '16', '32'].map(ram => (
            <button
              key={ram}
              onClick={() => handleChange('min_ram', ram)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                (filters.min_ram || '') === ram
                  ? 'bg-[#6D214F] border-[#6D214F] text-white shadow-xs'
                  : 'bg-[#FAF8F5] border-[#E9E2E5] text-[#6F6870] hover:bg-[#F7E8EE]'
              }`}
            >
              {ram ? `${ram}GB+` : 'Any'}
            </button>
          ))}
        </div>
      </div>

      {/* Storage Type */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#29252A] uppercase tracking-wider block">Storage Type</label>
        <select
          value={filters.storage_type || ''}
          onChange={(e) => handleChange('storage_type', e.target.value)}
          className="w-full text-xs bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl p-2.5 focus:ring-2 focus:ring-[#6D214F] focus:bg-white text-[#29252A]"
        >
          <option value="">Any Storage</option>
          <option value="SSD">SSD Only</option>
          <option value="HDD">HDD</option>
        </select>
      </div>

      {/* GPU Type */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-[#29252A] uppercase tracking-wider block">Graphics (GPU)</label>
        <select
          value={filters.gpu_type || ''}
          onChange={(e) => handleChange('gpu_type', e.target.value)}
          className="w-full text-xs bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl p-2.5 focus:ring-2 focus:ring-[#6D214F] focus:bg-white text-[#29252A]"
        >
          <option value="">All GPUs</option>
          <option value="Discrete">Discrete (Dedicated GPU)</option>
          <option value="Integrated">Integrated GPU</option>
        </select>
      </div>

      {/* Product Segment */}
      {segments.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#29252A] uppercase tracking-wider block">Segment</label>
          <select
            value={filters.product_segment || ''}
            onChange={(e) => handleChange('product_segment', e.target.value)}
            className="w-full text-xs bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl p-2.5 focus:ring-2 focus:ring-[#6D214F] focus:bg-white text-[#29252A]"
          >
            <option value="">All Segments</option>
            {segments.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      {/* Sorting */}
      <div className="space-y-2 border-t border-[#E9E2E5] pt-4">
        <label className="text-xs font-bold text-[#29252A] uppercase tracking-wider block">Sort By</label>
        <select
          value={filters.ordering || '-created_at'}
          onChange={(e) => handleChange('ordering', e.target.value)}
          className="w-full text-xs bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl p-2.5 focus:ring-2 focus:ring-[#6D214F] focus:bg-white text-[#29252A]"
        >
          <option value="-created_at">Newest First</option>
          <option value="price">Price: Low to High (₹)</option>
          <option value="-price">Price: High to Low (₹)</option>
          <option value="-rating">Highest Rated</option>
          <option value="weight_kg">Lightest Weight</option>
          <option value="-battery_life">Longest Battery Life</option>
        </select>
      </div>

    </aside>
  );
}
