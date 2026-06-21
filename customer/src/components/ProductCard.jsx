import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Eye, ShoppingCart, Star, AlertTriangle } from 'lucide-react';

const ProductCard = ({ product }) => {
  const { addToCart, setSelectedProduct } = useContext(CartContext);

  const getCategoryIconName = (subCategory) => {
    switch (subCategory) {
      case 'Kurta & Kurtis': return 'KRT';
      case 'Ethnic Dresses': return 'ANR';
      case 'Shirts': return 'SHR';
      case 'Jackets': return 'JKT';
      case 'Traditional': return 'KDS';
      case 'Bags': return 'BAG';
      case 'Grooming': return 'PRF';
      case 'Trousers': return 'TRN';
      case 'Western Dresses': return 'WST';
      case 'Cosmetics': return 'BTY';
      case 'Kurtas Combo': return 'CMB';
      case 'Shirts Combo': return 'CMB';
      default: return 'FSH';
    }
  };

  const defaultSize = product.sizes ? product.sizes[0] : 'One Size';
  const defaultColor = product.colors ? product.colors[0] : 'Default';

  const handleAddToCartClick = (e) => {
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart(product, defaultSize, defaultColor, 1);
    }
  };

  const handleQuickViewClick = (e) => {
    e.stopPropagation();
    setSelectedProduct(product);
  };

  return (
    <div 
      onClick={() => setSelectedProduct(product)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-light-border dark:border-dark-border bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] cursor-pointer"
    >
      
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.badge && (
          <span className="rounded-full bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            {product.badge}
          </span>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            <AlertTriangle className="h-3 w-3" />
            Low Stock
          </span>
        )}
        {product.stock === 0 && (
          <span className="rounded-full bg-slate-500 text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            Out of Stock
          </span>
        )}
      </div>

      {/* CSS Placeholder Image Container */}
      <div className={`relative aspect-square w-full bg-gradient-to-br ${product.gradient} flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:scale-105`}>
        
        <div className="absolute w-2/3 h-2/3 rounded-full border-4 border-dashed border-white/20 dark:border-slate-800/10 scale-90 group-hover:scale-100 group-hover:rotate-45 transition-all duration-700" />
        <div className="absolute w-1/2 h-1/2 rounded-3xl bg-white/20 dark:bg-slate-950/10 backdrop-blur-sm border border-white/30 transform rotate-12 flex items-center justify-center group-hover:rotate-45 transition-all duration-500 shadow-lg">
          <span className={`text-4xl font-extrabold tracking-widest ${product.textGradient} select-none`}>
            {getCategoryIconName(product.subCategory)}
          </span>
        </div>

        {/* Hover Action Buttons Overlay */}
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={handleQuickViewClick}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-900 shadow-md hover:bg-slate-100 hover:scale-110 active:scale-95 transition-all duration-200"
            title="Quick View"
          >
            <Eye className="h-5 w-5" />
          </button>
          
          <button
            onClick={handleAddToCartClick}
            disabled={product.stock === 0}
            className={`flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary text-white shadow-md hover:bg-brand-primary-hover hover:scale-110 active:scale-95 transition-all duration-200 ${
              product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Add to Cart"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Details Container */}
      <div className="flex flex-1 flex-col p-4 text-left">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {product.category} &rsaquo; {product.subCategory}
          </span>
          
          {/* Star Rating */}
          <div className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {product.rating}
            </span>
          </div>
        </div>

        <h3 className="mt-1 text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-primary transition-colors">
          {product.name}
        </h3>

        <p className="mt-1 text-xs text-light-text-muted dark:text-dark-text-muted line-clamp-2">
          {product.description}
        </p>

        {/* Pricing / CTA */}
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-light-border dark:border-dark-border">
          <span className="text-base font-extrabold text-slate-900 dark:text-white">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>
      </div>

    </div>
  );
};

export default ProductCard;
