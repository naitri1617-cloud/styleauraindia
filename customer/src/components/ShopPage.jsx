import React, { useState, useContext, useMemo } from 'react';
import { CartContext } from '../context/CartContext';
import ProductCard from './ProductCard';
import { SlidersHorizontal, Grid, List, RotateCcw, AlertCircle, Loader } from 'lucide-react';

const ShopPage = () => {
  const { products, loadingProducts, apiError, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useContext(CartContext);
  
  // Filter states
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(5000); // Max ₹5000
  const [selectedSize, setSelectedSize] = useState('All');
  const [sortBy, setSortBy] = useState('featured'); // featured, price-asc, price-desc, rating
  const [layoutMode, setLayoutMode] = useState('grid'); // grid, list

  // Derived filter options
  const categories = useMemo(() => {
    return ['All', ...new Set(products.map((p) => p.category))];
  }, [products]);

  const subCategories = useMemo(() => {
    const filtered = selectedCategory === 'All' 
      ? products 
      : products.filter((p) => p.category === selectedCategory);
    return ['All', ...new Set(filtered.map((p) => p.subCategory))];
  }, [products, selectedCategory]);

  const allSizes = useMemo(() => {
    const sizesSet = new Set();
    products.forEach((p) => {
      if (p.sizes) p.sizes.forEach((s) => sizesSet.add(s));
    });
    return ['All', ...Array.from(sizesSet)];
  }, [products]);

  // Handle category change, reset subcategory
  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setSelectedSubCategory('All');
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedSubCategory('All');
    setPriceRange(5000);
    setSelectedSize('All');
    setSortBy('featured');
    setSearchQuery('');
  };

  // Filter and sort items
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subCategory.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Subcategory filter
    if (selectedSubCategory !== 'All') {
      result = result.filter((p) => p.subCategory === selectedSubCategory);
    }

    // Price filter
    result = result.filter((p) => p.price <= priceRange);

    // Size filter
    if (selectedSize !== 'All') {
      result = result.filter((p) => p.sizes && p.sizes.includes(selectedSize));
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedSubCategory, priceRange, selectedSize, sortBy]);

  if (loadingProducts) {
    return (
      <div className="flex flex-col items-center justify-center p-24 min-h-[400px]">
        <Loader className="animate-spin h-8 w-8 text-brand-primary" />
        <p className="text-xs text-slate-500 mt-3 font-bold uppercase tracking-wider">Loading India Fashion Catalog...</p>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="mx-auto max-w-xl my-16 px-4">
        <div className="border border-dashed border-rose-200 dark:border-rose-900 bg-rose-50/20 dark:bg-rose-950/10 rounded-3xl p-8 text-center space-y-3">
          <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">API Connection Failure</h3>
          <p className="text-xs text-rose-500 leading-relaxed">
            {apiError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-light-border dark:border-dark-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Shop Indian Collection
          </h1>
          <p className="text-sm text-light-text-muted dark:text-dark-text-muted mt-1">
            Browse through our curated range of traditional wear, kurtis, casual shirts, and lifestyle accessories.
          </p>
        </div>

        {/* Search query tag feedback */}
        {searchQuery && (
          <div className="flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 rounded-full px-3 py-1 text-xs text-brand-primary font-medium w-fit">
            <span>Search results for: "{searchQuery}"</span>
            <button onClick={() => setSearchQuery('')} className="hover:text-brand-primary-hover font-bold ml-1">&times;</button>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Panel (Left Sidebar) */}
        <div className="lg:col-span-1 space-y-6 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-light-border dark:border-dark-border h-fit">
          <div className="flex items-center justify-between">
            <h2 className="text-md font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-brand-primary" />
              Filters
            </h2>
            <button 
              onClick={resetFilters}
              className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-2 text-left pt-4 border-t border-light-border dark:border-dark-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Category</h3>
            <div className="flex flex-wrap lg:flex-col gap-1.5 mt-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-all ${
                    selectedCategory === cat
                      ? 'bg-brand-primary text-white'
                      : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-light-border dark:border-dark-border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategory Filter (Conditional) */}
          {subCategories.length > 2 && (
            <div className="space-y-2 text-left pt-4 border-t border-light-border dark:border-dark-border">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Sub-Category</h3>
              <div className="flex flex-wrap lg:flex-col gap-1.5 mt-2">
                {subCategories.map((subCat) => (
                  <button
                    key={subCat}
                    onClick={() => setSelectedSubCategory(subCat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold text-left transition-all ${
                      selectedSubCategory === subCat
                        ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/30'
                        : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-light-border dark:border-dark-border'
                    }`}
                  >
                    {subCat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Range Filter */}
          <div className="space-y-2 text-left pt-4 border-t border-light-border dark:border-dark-border">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Max Price</h3>
              <span className="text-sm font-extrabold text-brand-primary">₹{priceRange.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="200"
              max="5000"
              step="100"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>₹200</span>
              <span>₹2,500</span>
              <span>₹5,000</span>
            </div>
          </div>

          {/* Sizes Filter */}
          <div className="space-y-2 text-left pt-4 border-t border-light-border dark:border-dark-border">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Size</h3>
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              {allSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                    selectedSize === size
                      ? 'bg-brand-primary text-white'
                      : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 border border-light-border dark:border-dark-border'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Product Catalog Grid / Right Content Area */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Sorting / Controls bar */}
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-905 px-4 py-3 rounded-xl border border-light-border dark:border-dark-border text-xs">
            <div className="text-slate-600 dark:text-slate-400 font-semibold">
              Showing <span className="text-slate-900 dark:text-white font-extrabold">{filteredProducts.length}</span> products
            </div>
            
            <div className="flex items-center gap-4">
              {/* Sort selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-light-border dark:border-dark-border rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-1 focus:ring-brand-primary font-medium"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              {/* Layout Mode selector */}
              <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-light-border dark:border-dark-border">
                <button
                  onClick={() => setLayoutMode('grid')}
                  className={`p-1.5 rounded ${layoutMode === 'grid' ? 'bg-brand-primary text-white' : 'text-slate-500 hover:text-brand-primary'}`}
                  title="Grid View"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setLayoutMode('list')}
                  className={`p-1.5 rounded ${layoutMode === 'list' ? 'bg-brand-primary text-white' : 'text-slate-500 hover:text-brand-primary'}`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Catalog Grid */}
          {filteredProducts.length > 0 ? (
            layoutMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              // List View Mode
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="flex flex-col sm:flex-row gap-4 border border-light-border dark:border-dark-border bg-white dark:bg-slate-900 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all text-left"
                  >
                    {/* Image placeholder */}
                    <div className={`w-full sm:w-40 aspect-square rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center text-3xl font-extrabold ${product.textGradient} flex-shrink-0`}>
                      {product.subCategory.substring(0, 3).toUpperCase()}
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-500">
                            {product.category} &rsaquo; {product.subCategory}
                          </span>
                          {product.badge && (
                            <span className="rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2 py-0.5 text-[9px] font-extrabold uppercase">
                              {product.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 hover:text-brand-primary">
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-light-border dark:border-dark-border flex flex-wrap items-center justify-between gap-4">
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(product);
                            }}
                            className="px-3 py-1.5 border border-light-border dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold rounded-lg text-slate-700 dark:text-white transition-colors"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // No Products State
            <div className="flex flex-col items-center justify-center border border-dashed border-light-border dark:border-dark-border rounded-3xl p-12 text-slate-500">
              <AlertCircle className="h-10 w-10 text-brand-primary mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No products found</h3>
              <p className="text-xs text-slate-500 max-w-xs text-center mt-1">
                Try widening your price range, choosing a different category, or resetting your filter choices.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 rounded-full bg-brand-primary px-5 py-2 text-xs font-bold text-white hover:bg-brand-primary-hover transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default ShopPage;
