import React, { useState, useContext, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { X, Plus, Minus, ShoppingBag, Check, Star } from 'lucide-react';

const QuickViewModal = () => {
  const { selectedProduct, setSelectedProduct, addToCart } = useContext(CartContext);
  
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      setSelectedSize(selectedProduct.sizes ? selectedProduct.sizes[0] : 'One Size');
      setSelectedColor(selectedProduct.colors ? selectedProduct.colors[0] : 'Default');
      setQuantity(1);
      setSuccessMsg(false);
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const handleAddToCart = () => {
    if (selectedProduct.stock >= quantity) {
      addToCart(selectedProduct, selectedSize, selectedColor, quantity);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/60 backdrop-blur-sm transition-opacity duration-300">
      
      <div 
        className="absolute inset-0 cursor-default" 
        onClick={() => setSelectedProduct(null)} 
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border shadow-2xl overflow-hidden flex flex-col md:flex-row z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-25 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-white border border-light-border dark:border-dark-border hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          aria-label="Close details"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Side: Product Image Placeholder */}
        <div className={`w-full md:w-1/2 aspect-square md:aspect-auto md:h-auto bg-gradient-to-br ${selectedProduct.gradient} flex items-center justify-center relative p-8`}>
          <div className="absolute w-3/4 h-3/4 rounded-full border-2 border-dashed border-white/10" />
          <div className="w-40 h-40 rounded-3xl bg-white/20 dark:bg-slate-950/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
            <span className={`text-5xl font-black ${selectedProduct.textGradient}`}>
              {selectedProduct.subCategory.substring(0, 3).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Right Side: Options and details */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between text-left overflow-y-auto max-h-[85svh] md:max-h-[500px]">
          
          <div className="space-y-4">
            {/* Category / Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
                {selectedProduct.category}
              </span>
              {selectedProduct.badge && (
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 text-[9px] font-bold uppercase">
                  {selectedProduct.badge}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
              {selectedProduct.name}
            </h2>

            {/* Ratings & Price */}
            <div className="flex items-center justify-between border-b border-light-border dark:border-dark-border pb-3">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                ₹{selectedProduct.price.toLocaleString('en-IN')}
              </span>
              
              <div className="flex items-center gap-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${
                        i < Math.floor(selectedProduct.rating) 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'text-slate-300 dark:text-slate-700'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350 ml-1">
                  {selectedProduct.rating} ({selectedProduct.reviewsCount} reviews)
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {selectedProduct.description}
            </p>

            {/* Colors selection */}
            {selectedProduct.colors && selectedProduct.colors.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Select Color: <span className="text-brand-primary font-extrabold">{selectedColor}</span>
                </span>
                <div className="flex gap-2">
                  {selectedProduct.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                        selectedColor === color
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white'
                          : 'bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-light-border dark:border-dark-border hover:bg-slate-50'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes selection */}
            {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Select Size: <span className="text-brand-primary font-extrabold">{selectedSize}</span>
                </span>
                <div className="flex gap-2 flex-wrap">
                  {selectedProduct.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-9 min-w-9 px-2 text-xs font-bold rounded-lg border flex items-center justify-center transition-all ${
                        selectedSize === size
                          ? 'bg-brand-primary text-white border-brand-primary'
                          : 'bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-light-border dark:border-dark-border hover:bg-slate-50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="mt-6 pt-4 border-t border-light-border dark:border-dark-border space-y-4">
            
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Quantity</span>
              
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-light-border dark:border-dark-border">
                <button
                  disabled={quantity <= 1}
                  onClick={() => setQuantity(quantity - 1)}
                  className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-xs font-extrabold text-slate-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  disabled={quantity >= selectedProduct.stock}
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              disabled={selectedProduct.stock === 0 || quantity > selectedProduct.stock}
              className={`w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 ${
                successMsg 
                  ? 'bg-emerald-600 shadow-emerald-600/20' 
                  : 'bg-brand-primary shadow-brand-primary/20 hover:bg-brand-primary-hover active:scale-98'
              } ${
                selectedProduct.stock === 0 ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed shadow-none' : ''
              }`}
            >
              {successMsg ? (
                <>
                  <Check className="h-4 w-4" /> Added to Cart!
                </>
              ) : selectedProduct.stock === 0 ? (
                'Out of Stock'
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" /> Add to Shopping Bag
                </>
              )}
            </button>
            
            {/* Direct stock feedback */}
            {selectedProduct.stock > 0 && selectedProduct.stock <= 5 && (
              <p className="text-center text-[10px] text-rose-500 font-extrabold">
                Only {selectedProduct.stock} items remaining in Surat warehouse!
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default QuickViewModal;
