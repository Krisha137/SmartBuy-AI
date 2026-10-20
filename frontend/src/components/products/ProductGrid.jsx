import React from 'react';
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from '../common/LoadingSkeleton';

export default function ProductGrid({ products = [], loading = false, skeletonCount = 6 }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.product_id} product={product} />
      ))}
    </div>
  );
}
