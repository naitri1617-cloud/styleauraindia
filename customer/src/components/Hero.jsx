import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { ArrowRight, Sparkles, ShoppingBag, Truck, CornerDownRight, RotateCcw } from 'lucide-react';

const Hero = () => {
  const { setCurrentView, setSelectedCategory } = useContext(CartContext);

  return (
    <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-950 py-12 sm:py-20 transition-colors duration-300">
      
      {/* Background blobs for premium depth */}
      <div className="absolute top-0 right-0 -z-10 h-[400px] w-[400px] rounded-full bg-purple-200/50 dark:bg-purple-900/10 blur-3xl" />
      <div className="absolute bottom-0 left-10 -z-10 h-[300px] w-[300px] rounded-full bg-amber-100/50 dark:bg-amber-900/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 dark:bg-brand-primary/20 px-3 py-1 text-xs font-semibold text-brand-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Festive Season Collection Live</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Redefining <span className="bg-gradient-to-r from-brand-primary to-purple-400 bg-clip-text text-transparent">Indian Fashion</span> with Aura.
            </h1>
            
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl">
              Elevate your festive and daily rotation with lightweight floral kurtis, designer anarkali suits, premium casual shirts, and hand-finished lifestyle accessories.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => { setCurrentView('shop'); setSelectedCategory('All'); }}
                className="flex items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-primary/25 hover:bg-brand-primary-hover hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <ShoppingBag className="h-4 w-4" />
                Shop Collection
                <ArrowRight className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => {
                  const el = document.getElementById('featured-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 rounded-full border border-light-border dark:border-dark-border bg-white dark:bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-850 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                Explore Bestsellers
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-light-border dark:border-dark-border max-w-md">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-semibold text-sm">
                  <Truck className="h-4 w-4 text-brand-primary" />
                  <span>Free Shipping</span>
                </div>
                <span className="text-xs text-light-text-muted dark:text-dark-text-muted">On orders above ₹999</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-semibold text-sm">
                  <RotateCcw className="h-4 w-4 text-brand-primary" />
                  <span>Easy Returns</span>
                </div>
                <span className="text-xs text-light-text-muted dark:text-dark-text-muted">Easy 7-day return policy</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-semibold text-sm">
                  <Sparkles className="h-4 w-4 text-brand-primary" />
                  <span>100% Authenticity</span>
                </div>
                <span className="text-xs text-light-text-muted dark:text-dark-text-muted">Direct from Surat hub</span>
              </div>
            </div>

          </div>

          {/* Banner Graphic Placeholder (CSS Gradient & Abstract Fashion Shapes) */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            
            {/* The main abstract placeholder mockup */}
            <div className="relative w-72 sm:w-96 h-96 sm:h-[450px] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 border border-slate-800 flex flex-col justify-between p-6">
              
              {/* Abstract garment styling mockup overlays inside */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-primary/20 via-transparent to-transparent opacity-70" />
              
              <div className="z-10 flex justify-between items-start">
                <div className="glass-card px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-brand-accent" /> StyleAura Exclusive
                </div>
                <span className="text-xl font-bold tracking-tight text-white/50">
                  IN/26
                </span>
              </div>

              {/* Graphic element representing garment layers */}
              <div className="z-10 relative flex-1 flex items-center justify-center py-6">
                <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-full bg-gradient-to-tr from-brand-primary via-purple-600 to-amber-200 blur-xl opacity-60 animate-pulse absolute" />
                
                {/* Floating CSS shapes resembling fashion wireframes */}
                <div className="relative w-40 h-56 sm:w-48 sm:h-64 border border-white/20 rounded-2xl bg-white/5 backdrop-blur-md transform rotate-6 shadow-inner flex flex-col justify-end p-4 transition-all duration-500 hover:rotate-2">
                  <div className="w-12 h-1 bg-white/40 rounded-full mb-2" />
                  <div className="w-full h-8 bg-white/10 rounded-lg flex items-center justify-between px-2">
                    <div className="w-16 h-2 bg-white/30 rounded-full" />
                    <div className="w-4 h-4 rounded-full bg-brand-primary" />
                  </div>
                </div>
                
                <div className="absolute w-36 h-48 sm:w-40 sm:h-52 border border-white/15 rounded-2xl bg-black/25 backdrop-blur-sm transform -rotate-6 translate-x-4 -translate-y-4 flex flex-col justify-between p-4">
                  <div className="flex justify-between">
                    <div className="w-3 h-3 rounded-full bg-brand-accent" />
                    <div className="w-8 h-1 bg-white/20 rounded-full" />
                  </div>
                  <div className="space-y-1">
                    <div className="w-12 h-2 bg-white/30 rounded-full" />
                    <div className="w-8 h-2 bg-white/20 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="z-10 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 text-left">
                <div className="text-xs text-purple-400 font-semibold uppercase tracking-wider">Ethnic Collection</div>
                <div className="text-white font-bold text-sm sm:text-base mt-0.5">Women Floral Cotton Kurti</div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-brand-accent font-extrabold text-sm sm:text-base">₹799.00</span>
                  <button 
                    onClick={() => { setCurrentView('shop'); setSelectedCategory('All'); }}
                    className="text-xs text-white bg-brand-primary hover:bg-brand-primary-hover px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold transition-all"
                  >
                    Buy Now <CornerDownRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default Hero;
