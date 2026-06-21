import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { ShoppingBag, Search, Sun, Moon, Sparkles, MapPin, User } from 'lucide-react';

const Navbar = () => {
  const {
    cart,
    currentView,
    setCurrentView,
    cartOpen,
    setCartOpen,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    theme,
    toggleTheme
  } = useContext(CartContext);

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (currentView !== 'shop') {
      setCurrentView('shop');
    }
  };

  const navLinks = [
    { label: 'Home', action: () => { setCurrentView('home'); setSelectedCategory('All'); setSearchQuery(''); } },
    { label: 'Shop Collection', action: () => { setCurrentView('shop'); setSelectedCategory('All'); } },
    { label: 'Women', action: () => { setCurrentView('shop'); setSelectedCategory('Women'); } },
    { label: 'Men', action: () => { setCurrentView('shop'); setSelectedCategory('Men'); } },
    { label: 'Kids', action: () => { setCurrentView('shop'); setSelectedCategory('Kids'); } },
    { label: 'Accessories', action: () => { setCurrentView('shop'); setSelectedCategory('Accessories'); } },
    { label: 'Beauty', action: () => { setCurrentView('shop'); setSelectedCategory('Beauty'); } },
    { label: 'Sale', action: () => { setCurrentView('shop'); setSelectedCategory('Sale'); } },
    { label: 'Track Order', action: () => { setCurrentView('track-order'); } }
  ];

  const isLinkActive = (link) => {
    if (link.label === 'Home') return currentView === 'home';
    if (link.label === 'Shop Collection') return currentView === 'shop' && selectedCategory === 'All';
    if (link.label === 'Women') return currentView === 'shop' && selectedCategory === 'Women';
    if (link.label === 'Men') return currentView === 'shop' && selectedCategory === 'Men';
    if (link.label === 'Kids') return currentView === 'shop' && selectedCategory === 'Kids';
    if (link.label === 'Accessories') return currentView === 'shop' && selectedCategory === 'Accessories';
    if (link.label === 'Beauty') return currentView === 'shop' && selectedCategory === 'Beauty';
    if (link.label === 'Sale') return currentView === 'shop' && selectedCategory === 'Sale';
    if (link.label === 'Track Order') return currentView === 'track-order';
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-light-border dark:border-dark-border glass-effect transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo */}
          <div 
            onClick={() => { setCurrentView('home'); setSelectedCategory('All'); setSearchQuery(''); }}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary text-white shadow-md shadow-brand-primary/20 transition-all duration-300 group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
              Style<span className="text-brand-primary">Aura</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-medium tracking-wider uppercase bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded border border-brand-primary/20">
              India
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.action}
                className={`text-xs xl:text-sm font-semibold transition-colors hover:text-brand-primary ${
                  isLinkActive(link)
                    ? 'text-brand-primary underline underline-offset-4 decoration-2 font-bold'
                    : 'text-slate-655 dark:text-slate-300'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-xs relative hidden md:block">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search fashion..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="block w-full rounded-full border border-light-border dark:border-dark-border bg-slate-100/50 dark:bg-slate-800/50 py-1.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-brand-primary focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all duration-200"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search Toggle for Mobile */}
            <button 
              onClick={() => { setCurrentView('shop'); }}
              className="p-2 md:hidden text-slate-600 dark:text-slate-300 hover:text-brand-primary rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Mobile Track Order shortcut */}
            <button 
              onClick={() => { setCurrentView('track-order'); }}
              className={`p-2 lg:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                currentView === 'track-order' ? 'text-brand-primary' : 'text-slate-600 dark:text-slate-300'
              }`}
              title="Track Order"
            >
              <MapPin className="h-5 w-5" />
            </button>

            {/* My Account (User profile shortcut) */}
            <button
              onClick={() => { setCurrentView('my-account'); }}
              className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                currentView === 'my-account' ? 'text-brand-primary' : 'text-slate-600 dark:text-slate-300'
              }`}
              title="My Account"
            >
              <User className="h-5 w-5" />
            </button>

            {/* Dark Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-brand-primary rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(!cartOpen)}
              className="relative flex items-center justify-center p-2 text-slate-600 dark:text-slate-300 hover:text-brand-primary rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-white ring-2 ring-white dark:ring-dark-bg animate-pulse">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
