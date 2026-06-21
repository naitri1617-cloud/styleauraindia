import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import { X, Trash2, ShoppingBag, Plus, Minus, Tag, Check } from 'lucide-react';

const CartDrawer = ({ onOpenCheckout }) => {
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateCartQuantity,
    removeFromCart,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    setCurrentView
  } = useContext(CartContext);

  const [couponCode, setCouponCode] = useState('');

  if (!cartOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  
  // India Shipping calculations: Free above ₹999, or if FREESHIP applied, otherwise ₹99
  const isFreeShipping = subtotal >= 999.00 || appliedCoupon?.code === 'FREESHIP';
  const shippingFee = isFreeShipping ? 0.00 : 99.00;
  
  let discountAmount = 0;
  if (appliedCoupon?.type === 'percent') {
    discountAmount = subtotal * appliedCoupon.discount;
  } else if (appliedCoupon?.type === 'shipping') {
    discountAmount = 99.00;
  }

  const finalTotal = subtotal + shippingFee - discountAmount;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim() !== '') {
      const success = applyCoupon(couponCode);
      if (success) setCouponCode('');
    }
  };

  const handleCheckoutClick = () => {
    setCartOpen(false);
    onOpenCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-955/60 backdrop-blur-sm transition-opacity duration-300">
      
      <div 
        className="absolute inset-0 cursor-default" 
        onClick={() => setCartOpen(false)} 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        
        {/* Sliding Panel */}
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-light-border dark:border-dark-border shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
          
          {/* Header */}
          <div className="px-4 py-6 border-b border-light-border dark:border-dark-border flex items-center justify-between sm:px-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-brand-primary" />
              Shopping Bag
            </h2>
            <button
              onClick={() => setCartOpen(false)}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Contents */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {cart.length > 0 ? (
              cart.map((item, index) => (
                <div 
                  key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${index}`}
                  className="flex gap-4 p-3 rounded-xl border border-light-border dark:border-dark-border bg-slate-50/50 dark:bg-slate-955/20 text-left items-start"
                >
                  {/* Small gradient placeholder */}
                  <div className={`w-20 h-20 rounded-lg bg-gradient-to-br ${item.product.gradient} flex items-center justify-center font-extrabold text-xs text-slate-800/80 flex-shrink-0 border border-white/20 shadow-inner`}>
                    {item.product.subCategory.substring(0, 3).toUpperCase()}
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-1">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {item.product.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Size: {item.selectedSize} &middot; Color: {item.selectedColor}
                    </p>
                    
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      
                      {/* Controls */}
                      <div className="flex items-center bg-white dark:bg-slate-800 border border-light-border dark:border-dark-border rounded-lg p-0.5 scale-90 origin-right">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-500"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-500"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedColor)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                </div>
              ))
            ) : (
              // Empty State
              <div className="flex flex-col items-center justify-center h-full text-slate-500 py-12">
                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-850 rounded-full flex items-center justify-center mb-4 text-slate-450 border border-light-border dark:border-dark-border">
                  <ShoppingBag className="h-7 w-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Your bag is empty</h3>
                <p className="text-xs text-slate-500 max-w-[200px] text-center mt-1">
                  Start adding products from our Indian fashion shop page to see them here!
                </p>
                <button
                  onClick={() => { setCartOpen(false); setCurrentView('shop'); }}
                  className="mt-4 rounded-full bg-brand-primary px-5 py-2 text-xs font-bold text-white hover:bg-brand-primary-hover transition-colors"
                >
                  Shop Catalog
                </button>
              </div>
            )}
          </div>

          {/* Footer Calculations */}
          {cart.length > 0 && (
            <div className="border-t border-light-border dark:border-dark-border px-4 py-6 sm:px-6 space-y-4 bg-slate-50/50 dark:bg-slate-955/20">
              
              {/* Coupon code input */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Enter code (STYLE10 or INDIA20)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="block w-full rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-slate-850 py-2 px-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-xs font-bold hover:bg-slate-800"
                >
                  Apply
                </button>
              </form>

              {/* Coupon status feedback */}
              {couponError && <p className="text-left text-[10px] text-rose-500 font-bold">{couponError}</p>}
              {appliedCoupon && (
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold text-left">
                  <span className="flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> Coupon applied: {appliedCoupon.code}
                  </span>
                  <button onClick={removeCoupon} className="text-slate-400 hover:text-slate-650 ml-1">&times;</button>
                </div>
              )}

              {/* Pricing details */}
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    Standard Delivery (India) 
                    {subtotal >= 999.00 && (
                      <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 px-1 rounded">
                        Free Shipping
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {shippingFee === 0.00 ? 'FREE' : `₹${shippingFee}`}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount</span>
                    <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-900 dark:text-white font-extrabold text-sm border-t border-light-border dark:border-dark-border pt-2 mt-2">
                  <span>Total (Inc. GST)</span>
                  <span>₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckoutClick}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-primary py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 hover:bg-brand-primary-hover active:scale-98 transition-all"
              >
                Proceed to Checkout
              </button>

              {/* Additional India disclaimer */}
              <p className="text-[10px] text-slate-400 text-center">
                Easy 7-day return policy. Cash on Delivery available.
              </p>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default CartDrawer;
