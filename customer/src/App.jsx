import React, { useContext, useState } from 'react';
import { CartContext } from './context/CartContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ShopPage from './components/ShopPage';
import ProductCard from './components/ProductCard';
import QuickViewModal from './components/QuickViewModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import { ArrowRight, Sparkles, Mail, CheckCircle2, Shield, Heart, Star, PhoneCall, Gift, Clock, MapPin, Search, Calendar, Landmark, Smartphone, CreditCard, AlertCircle, User } from 'lucide-react';

function App() {
  const { 
    currentView, 
    setCurrentView, 
    products, 
    trackOrder, 
    trackedOrder, 
    setTrackedOrder, 
    trackingLoading, 
    trackingError,
    setSelectedCategory
  } = useContext(CartContext);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [activePolicyTab, setActivePolicyTab] = useState('shipping'); // 'shipping', 'return', 'privacy', 'terms'
  const [trackingInput, setTrackingInput] = useState('');

  const [accountOrders, setAccountOrders] = useState([]);
  const [accountOrdersLoading, setAccountOrdersLoading] = useState(false);
  const [accountOrdersError, setAccountOrdersError] = useState('');
  const [accountPhoneSearch, setAccountPhoneSearch] = useState('');

  const fetchAccountOrders = async (phone) => {
    try {
      setAccountOrdersLoading(true);
      setAccountOrdersError('');
      setAccountOrders([]);
      
      const cleanPhone = phone.replace(/[\s+-]/g, '').trim();
      const res = await fetch(`/api/orders`);
      if (!res.ok) throw new Error('Failed to retrieve order registry from server');
      const allOrders = await res.json();
      
      // Filter orders by phone matching
      const matching = allOrders.filter(o => 
        o.shippingDetails.phone.replace(/[\s+-]/g, '').endsWith(cleanPhone)
      );
      
      setAccountOrders(matching);
    } catch (err) {
      setAccountOrdersError(err.message || 'Error loading orders.');
    } finally {
      setAccountOrdersLoading(false);
    }
  };

  // Extract featured products & new arrivals
  const featuredProducts = products.filter(p => p.featured).slice(0, 3);
  const newArrivals = products.filter(p => !p.featured).slice(0, 3);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubscribed(false), 5000);
    }
  };

  const handleTrackingSubmit = (e) => {
    e.preventDefault();
    trackOrder(trackingInput);
  };

  const demoBusinessDetails = {
    name: "StyleAura India",
    address: "302, Fashion Hub, Ring Road, Surat, Gujarat 395002, India",
    phone: "+91 98765 43210",
    email: "support@styleauraindia.com",
    hours: "Monday to Saturday, 10:00 AM to 7:00 PM"
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200 flex flex-col font-sans transition-colors duration-300">
      
      {/* Sticky Glass Navbar */}
      <Navbar />

      {/* Main View Router */}
      <main className="flex-grow">
        
        {currentView === 'home' && (
          <div className="space-y-16 pb-16">
            
            {/* Hero Section */}
            <Hero />

            {/* Shop By Category Section */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Shop by Category
                </h2>
                <p className="text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted">
                  Discover cotton fabrics, ethnic wear, and daily essentials crafted in India.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {/* Category 1 */}
                <div 
                  onClick={() => { setCurrentView('shop'); setSelectedCategory('Women'); }}
                  className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer bg-gradient-to-br from-indigo-900 to-slate-900 border border-slate-850 p-6 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all hover:scale-[1.01]"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-brand-primary/20 via-transparent to-transparent opacity-80" />
                  <span className="text-[10px] font-bold text-white bg-brand-primary px-2.5 py-0.5 rounded-full w-fit uppercase tracking-wider">
                    Ethnic Staples
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-white">Women Ethnic</h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 group-hover:text-white transition-colors">
                      Browse Kurtis &amp; Anarkalis <ArrowRight className="h-3 w-3" />
                    </p>
                  </div>
                </div>

                {/* Category 2 */}
                <div 
                  onClick={() => { setCurrentView('shop'); setSelectedCategory('Men'); }}
                  className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer bg-gradient-to-br from-slate-900 via-emerald-955 to-slate-900 border border-slate-855 p-6 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all hover:scale-[1.01]"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-80" />
                  <span className="text-[10px] font-bold text-white bg-emerald-600 px-2.5 py-0.5 rounded-full w-fit uppercase tracking-wider">
                    Light Linen
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-white">Men Casuals</h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 group-hover:text-white transition-colors">
                      Browse Shirts &amp; Chinos <ArrowRight className="h-3 w-3" />
                    </p>
                  </div>
                </div>

                {/* Category 3 */}
                <div 
                  onClick={() => { setCurrentView('shop'); setSelectedCategory('Accessories'); }}
                  className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer bg-gradient-to-br from-slate-900 via-amber-955 to-slate-900 border border-slate-855 p-6 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all hover:scale-[1.01]"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent opacity-80" />
                  <span className="text-[10px] font-bold text-white bg-brand-accent px-2.5 py-0.5 rounded-full w-fit uppercase tracking-wider">
                    Handmade
                  </span>
                  <div>
                    <h3 className="text-xl font-bold text-white">Bags &amp; Accessories</h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1 group-hover:text-white transition-colors">
                      Browse Totes &amp; Grooming <ArrowRight className="h-3 w-3" />
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Sale / Promotion Banner */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row justify-between items-center text-left gap-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-62 w-62 rounded-full bg-brand-primary/10 blur-3xl pointer-events-none" />
                <div className="space-y-2 z-10">
                  <span className="text-[10px] font-bold text-brand-accent uppercase tracking-wider flex items-center gap-1.5">
                    <Gift className="h-4 w-4" /> Festive Celebration Launch Offer
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">Flat 20% Off on Ethnic &amp; Casuals</h3>
                  <p className="text-xs text-slate-400 max-w-lg">
                    Celebrate the festive season with our biggest coupon discounts yet. Apply code <span className="text-white font-extrabold px-1.5 py-0.5 bg-slate-850 rounded border border-white/20">INDIA20</span> at checkout.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView('shop')}
                  className="rounded-full bg-white hover:bg-slate-100 text-slate-900 font-bold px-6 py-3 text-xs flex items-center gap-1 shadow-lg shrink-0 transition-transform active:scale-95"
                >
                  Shop Now <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </section>

            {/* New Arrivals Section */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-light-border dark:border-dark-border pb-4 gap-4">
                <div className="text-left space-y-1">
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-brand-primary" />
                    New Arrivals
                  </h2>
                  <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
                    Freshly tailormade styles straight from Surat's weaving hub.
                  </p>
                </div>
                
                <button
                  onClick={() => setCurrentView('shop')}
                  className="text-xs font-bold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 self-start"
                >
                  View full catalog <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                  {newArrivals.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 py-12 text-center">Catalog is currently empty.</div>
              )}
            </section>

            {/* Best Sellers Section */}
            <section id="featured-section" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between border-b border-light-border dark:border-dark-border pb-4 gap-4">
                <div className="text-left space-y-1">
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <Star className="h-5 w-5 fill-brand-primary text-brand-primary" />
                    Bestseller Favorites
                  </h2>
                  <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
                    The highest rated products currently charting customer orders.
                  </p>
                </div>
              </div>

              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                  {featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 py-12 text-center">Catalog is currently empty.</div>
              )}
            </section>

            {/* Why Shop With Us (Indian Context) */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 bg-slate-900 text-white rounded-3xl py-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-brand-primary/10 blur-3xl pointer-events-none" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider block">Artisan Sourcing</span>
                  <h3 className="text-lg font-bold">100% Cotton Weft</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sourced from organic cotton growers in Gujarat and central India, assuring lightweight texture and breathability.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider block">Local Hub</span>
                  <h3 className="text-lg font-bold">Surat Weaving Excellence</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    StyleAura products are woven and finished locally in Surat, supporting generational weavers and quality craftsmanship.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider block">Fast Delivery</span>
                  <h3 className="text-lg font-bold">Pan-India Dispatches</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Quick dispatch pipelines across metro centers and tier zones with tracking details. COD available for secure delivery.
                  </p>
                </div>
              </div>
            </section>

            {/* Customer Reviews Section */}
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Loved by Customers
                </h2>
                <p className="text-xs text-slate-505">
                  Hear what customer testimonials say about StyleAura's fitting and cloth textures.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 text-left">
                <div className="bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border p-6 rounded-2xl space-y-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400" />)}
                  </div>
                  <p className="text-xs text-slate-655 dark:text-slate-400 italic leading-relaxed">
                    "The cotton Anarkali set fits like a glove. The gota border styling is delicate and didn't fade after two washing cycles. Best Indian ethnic collection online."
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="h-7 w-7 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-[10px]">AD</div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Ananya Deshmukh</div>
                      <div className="text-[9px] text-slate-400">Mumbai &middot; Verified Buyer</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border p-6 rounded-2xl space-y-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400" />)}
                  </div>
                  <p className="text-xs text-slate-655 dark:text-slate-400 italic leading-relaxed">
                    "Awesome linen shirt. Perfect for Mumbai heat. Very lightweight material but doesn't feel cheap. Highly recommend their Men Casuals collection!"
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="h-7 w-7 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-[10px]">RP</div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Rahul Patel</div>
                      <div className="text-[9px] text-slate-400">Ahmedabad &middot; Verified Buyer</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border p-6 rounded-2xl space-y-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400" />)}
                  </div>
                  <p className="text-xs text-slate-655 dark:text-slate-400 italic leading-relaxed">
                    "Ordered the Floral Kurti. The print colors are very vibrant and fabric is soft cotton. Deliveries took only 3 days to Bengaluru. Will order more."
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="h-7 w-7 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-[10px]">KN</div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Kavitha Nair</div>
                      <div className="text-[9px] text-slate-400">Bengaluru &middot; Verified Buyer</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Newsletter Sign up */}
            <section className="mx-auto max-w-xl px-4 sm:px-6">
              <div className="border border-light-border dark:border-dark-border bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                  <Mail className="h-6 w-6" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Join the Aura Club</h3>
                  <p className="text-xs text-slate-500">
                    Get 10% off your first order & priority access to festive coupon releases.
                  </p>
                </div>

                {newsletterSubscribed ? (
                  <div className="flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-lg p-2">
                    <CheckCircle2 className="h-4 w-4" /> Code <span className="font-extrabold underline">STYLE10</span> applied! Use it at checkout.
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="flex-1 rounded-full border border-light-border dark:border-dark-border bg-slate-50 dark:bg-slate-855 px-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                    <button
                      type="submit"
                      className="rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2 text-xs font-bold hover:bg-slate-800"
                    >
                      Subscribe
                    </button>
                  </form>
                )}
              </div>
            </section>

          </div>
        )}

        {currentView === 'shop' && <ShopPage />}
        
        {/* Track Order View */}
        {currentView === 'track-order' && (
          <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 text-left space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Track Your Order</h1>
              <p className="text-sm text-slate-500">
                Enter your Order Reference ID (e.g. ORD-123456) or billing Mobile Number (+91 format) to check dispatch updates.
              </p>
            </div>

            <form onSubmit={handleTrackingSubmit} className="flex gap-2 bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border p-2 rounded-2xl shadow-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="ORD-XXXXXX or +91 XXXXX XXXXX"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="w-full bg-transparent border-0 pl-10 pr-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-0"
                />
              </div>
              <button
                type="submit"
                disabled={trackingLoading}
                className="rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-bold px-6 py-2.5 text-xs transition-colors shrink-0 disabled:opacity-50"
              >
                {trackingLoading ? 'Searching...' : 'Track Status'}
              </button>
            </form>

            {trackingError && (
              <div className="border border-dashed border-rose-200 dark:border-rose-900 bg-rose-50/20 dark:bg-rose-950/10 rounded-2xl p-4 text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{trackingError}</span>
              </div>
            )}

            {/* Tracked Order Stepper Details */}
            {trackedOrder && (
              <div className="bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-200">
                
                {/* Meta details */}
                <div className="flex justify-between items-start border-b border-light-border dark:border-dark-border pb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Order: <span className="text-brand-primary tracking-wider">{trackedOrder.id}</span></h3>
                    <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                      <Calendar className="h-3.5 w-3.5" /> Booked on {trackedOrder.date}
                    </p>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    trackedOrder.status === 'Delivered'
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : trackedOrder.status === 'Shipped'
                      ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                      : trackedOrder.status === 'Cancelled'
                      ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                      : trackedOrder.status === 'Processing'
                      ? 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20'
                      : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  }`}>
                    {trackedOrder.status}
                  </div>
                </div>

                {/* Tracking status stepper */}
                {trackedOrder.status !== 'Cancelled' ? (
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Dispatch Progress</span>
                    <div className="grid grid-cols-4 gap-2 relative">
                      
                      {/* Connection bar */}
                      <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
                      
                      {/* Steps */}
                      {[
                        { label: 'Pending', active: ['Pending', 'Processing', 'Shipped', 'Delivered'] },
                        { label: 'Processing', active: ['Processing', 'Shipped', 'Delivered'] },
                        { label: 'Shipped', active: ['Shipped', 'Delivered'] },
                        { label: 'Delivered', active: ['Delivered'] }
                      ].map((step, idx) => {
                        const isCurrent = trackedOrder.status === step.label;
                        const isDone = step.active.includes(trackedOrder.status);

                        return (
                          <div key={idx} className="flex flex-col items-center z-10 text-center space-y-1.5">
                            <div className={`h-8 w-8 rounded-full border flex items-center justify-center font-bold text-xs transition-all ${
                              isCurrent 
                                ? 'bg-brand-primary text-white border-brand-primary scale-110 shadow-lg shadow-brand-primary/20' 
                                : isDone 
                                ? 'bg-emerald-500 text-white border-emerald-500' 
                                : 'bg-white dark:bg-slate-900 text-slate-400 border-light-border dark:border-dark-border'
                            }`}>
                              {idx + 1}
                            </div>
                            <span className={`text-[10px] font-bold ${isDone ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl p-4 text-xs font-semibold">
                    This order has been Cancelled by the client or administrator. If this was an error, please reach support.
                  </div>
                )}

                {/* Items Summaries */}
                <div className="border-t border-light-border dark:border-dark-border pt-4 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Items ordered</span>
                  <div className="divide-y divide-light-border dark:divide-dark-border">
                    {trackedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-2 text-xs">
                        <span className="text-slate-800 dark:text-slate-250 font-bold">
                          {item.product.name} <span className="text-slate-400 font-normal">({item.selectedSize} &middot; {item.selectedColor})</span>
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">
                          {item.quantity} x ₹{item.product.price.toLocaleString('en-IN')} = ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer / Address summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-light-border dark:border-dark-border pt-4 text-xs">
                  <div className="space-y-1 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Delivery Address</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {trackedOrder.shippingDetails.fullName}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      {trackedOrder.shippingDetails.address}, {trackedOrder.shippingDetails.city}, {trackedOrder.shippingDetails.state} - {trackedOrder.shippingDetails.postcode}
                    </p>
                  </div>
                  
                  <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Billing Summary</span>
                    <div className="flex justify-between text-[11px]">
                      <span>Subtotal</span>
                      <span className="font-semibold">₹{trackedOrder.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Delivery Fee</span>
                      <span className="font-semibold">{trackedOrder.shipping === 0 ? 'FREE' : `₹${trackedOrder.shipping}`}</span>
                    </div>
                    {trackedOrder.discount > 0 && (
                      <div className="flex justify-between text-[11px] text-emerald-600">
                        <span>Discount Code ({trackedOrder.couponApplied})</span>
                        <span>- ₹{trackedOrder.discount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-extrabold border-t border-slate-200 dark:border-slate-800 pt-1.5 text-slate-900 dark:text-white">
                      <span>Total</span>
                      <span>₹{trackedOrder.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* My Account View */}
        {currentView === 'my-account' && (
          <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 text-left space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight animate-in slide-in-from-top-4 duration-300">My Account</h1>
              <p className="text-sm text-slate-500">
                Manage your profile, shipping details, and view your order history.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Profile Card */}
              <div className="md:col-span-1 bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border p-6 rounded-3xl space-y-4 shadow-sm text-xs">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm">
                    GU
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">Guest User</h3>
                    <p className="text-slate-400">Personal Account</p>
                  </div>
                </div>

                <div className="divide-y divide-light-border dark:divide-dark-border">
                  <div className="py-2.5">
                    <span className="text-slate-400 font-bold block">Country / Market</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">India (INR ₹)</span>
                  </div>
                  <div className="py-2.5">
                    <span className="text-slate-400 font-bold block">Surat Head Studio</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">StyleAura Hub Sourcing</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-light-border dark:border-dark-border text-center text-slate-400">
                  Save your address at checkout to complete profiles.
                </div>
              </div>

              {/* Order History */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border p-6 rounded-3xl text-xs space-y-4 shadow-sm">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Order History Retrieval</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Input your mobile number below to retrieve and review all purchases registered to your phone.
                  </p>
                  
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const mobileNum = e.target.elements.accountPhone.value.trim();
                      if (mobileNum) {
                        setAccountPhoneSearch(mobileNum);
                        fetchAccountOrders(mobileNum);
                      }
                    }} 
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      name="accountPhone"
                      required
                      placeholder="e.g. +91 98765 43210"
                      className="flex-1 rounded-xl border border-light-border dark:border-dark-border bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-bold px-5 py-2.5 cursor-pointer transition-all"
                    >
                      Retrieve Orders
                    </button>
                  </form>

                  {accountOrdersLoading && (
                    <div className="text-center py-6 text-slate-500 font-bold">Querying server ledger...</div>
                  )}

                  {accountOrdersError && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl p-3">
                      {accountOrdersError}
                    </div>
                  )}

                  {accountOrders.length > 0 ? (
                    <div className="space-y-4 pt-4 border-t border-light-border dark:border-dark-border">
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Found {accountOrders.length} Order(s)</span>
                      
                      <div className="divide-y divide-light-border dark:divide-dark-border max-h-[300px] overflow-y-auto pr-2">
                        {accountOrders.map((order) => (
                          <div key={order.id} className="py-3 flex justify-between items-center flex-wrap gap-2 border-b border-light-border dark:border-dark-border last:border-0 last:pb-0">
                            <div>
                              <span className="font-extrabold text-brand-primary text-sm tracking-wider block">{order.id}</span>
                              <span className="text-slate-400 block mt-0.5">{order.date} &middot; {order.items.reduce((sum, i) => sum + i.quantity, 0)} items</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-extrabold text-slate-900 dark:text-white">₹{order.total.toLocaleString('en-IN')}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                order.status === 'Delivered' ? 'bg-emerald-500/15 text-emerald-600' :
                                order.status === 'Cancelled' ? 'bg-rose-500/15 text-rose-600' :
                                'bg-amber-500/15 text-amber-600'
                              }`}>
                                {order.status}
                              </span>
                              <button
                                onClick={() => {
                                  setTrackedOrder(order);
                                  setCurrentView('track-order');
                                }}
                                className="text-brand-primary font-bold hover:underline cursor-pointer"
                              >
                                Track &rsaquo;
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    accountPhoneSearch && !accountOrdersLoading && (
                      <div className="text-center py-6 text-slate-400 font-semibold italic">
                        No orders found matching the mobile number "{accountPhoneSearch}".
                      </div>
                    )
                  )}

                </div>
              </div>
            </div>
          </div>
        )}

        {/* Policies tab */}
        {currentView === 'policies' && (
          <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 text-left space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Policies &amp; Disclaimers</h1>
              <p className="text-sm text-slate-500">Read our guidelines for shipping, returns, privacy, and purchase terms.</p>
            </div>

            {/* Horizontal Subtabs */}
            <div className="flex bg-slate-100 dark:bg-slate-850 p-0.5 rounded-xl border border-light-border dark:border-dark-border w-fit mx-auto">
              {[
                { id: 'shipping', label: 'Shipping Policy' },
                { id: 'return', label: 'Returns & Refunds' },
                { id: 'privacy', label: 'Privacy Policy' },
                { id: 'terms', label: 'Terms & Conditions' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActivePolicyTab(tab.id)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    activePolicyTab === tab.id
                      ? 'bg-brand-primary text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-350 hover:text-brand-primary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border rounded-3xl p-6 sm:p-8 space-y-4">
              {activePolicyTab === 'shipping' && (
                <div className="space-y-3 leading-relaxed text-xs">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Shipping &amp; Delivery</h2>
                  <p>Welcome to StyleAura India. We dispatch all our products directly from our state-of-the-art weaving and logistics hub in Surat, Gujarat. We partner with India's leading courier networks (Delhivery, Blue Dart, and Speed Post) to guarantee quick and secure delivery.</p>
                  <h3 className="font-bold text-slate-900 dark:text-white mt-4">Shipping Rates &amp; Delivery Timelines</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Free Delivery:</strong> Applied automatically on all orders above ₹999 across India.</li>
                    <li><strong>Standard Shipping Fee:</strong> A fee of ₹99 is charged on orders below ₹999.</li>
                    <li><strong>Delivery Timelines:</strong> 3 to 7 business days depending on customer state. Metro zones (Delhi, Mumbai, Bengaluru) generally receive orders inside 3 days.</li>
                  </ul>
                  <h3 className="font-bold text-slate-900 dark:text-white mt-4">Cash on Delivery (COD)</h3>
                  <p>COD is available for pincodes serviced by our courier network. No extra fee is charged on cash dispatches.</p>
                </div>
              )}

              {activePolicyTab === 'return' && (
                <div className="space-y-3 leading-relaxed text-xs">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">7-Day Easy Return &amp; Refund Policy</h2>
                  <p>At StyleAura India, customer satisfaction is our top priority. We provide an easy, hassle-free 7-day return policy for all garments and accessories.</p>
                  <h3 className="font-bold text-slate-900 dark:text-white mt-4">Conditions for Returns</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>The item must be unused, unwashed, and in its original packing with tags intact.</li>
                    <li>Items on clearance sales or festive discount tags may only be eligible for exchanges.</li>
                  </ul>
                  <h3 className="font-bold text-slate-900 dark:text-white mt-4">Refund Process</h3>
                  <p>Once your return package is picked up and audited at our Surat warehouse, refunds are initiated inside 48 hours. For COD orders, refund is made to your bank account via UPI. Credit Card/UPI prepayments are returned directly to the source channel inside 5-7 working days.</p>
                </div>
              )}

              {activePolicyTab === 'privacy' && (
                <div className="space-y-3 leading-relaxed text-xs">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Privacy Policy</h2>
                  <p>StyleAura India is committed to protecting your personal information. This Privacy Policy details how we handle names, mobile numbers, email addresses, and shipping PIN codes collected during order processing.</p>
                  <h3 className="font-bold text-slate-900 dark:text-white mt-4">Data Collection and Usage</h3>
                  <p>We use billing data purely to ship purchases, process secure UPI and card payments, and dispatch order tracking updates. We do not sell your personal details to third-party databases.</p>
                </div>
              )}

              {activePolicyTab === 'terms' && (
                <div className="space-y-3 leading-relaxed text-xs">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Terms &amp; Conditions</h2>
                  <p>These Terms &amp; Conditions govern the use of StyleAura India's digital platform. By completing a mock purchase, registering an account, or subscribing to our newsletters, you agree to comply with these terms.</p>
                  <p>All catalog materials, including graphics, design mockups, and text definitions, belong to StyleAura India. Product prices are listed in INR (₹) and include applicable taxes (GST).</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Page */}
        {currentView === 'contact' && (
          <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 text-left space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Contact Us</h1>
              <p className="text-sm text-slate-500">Reach out for any custom inquiries, shipping requests, or sizing assistance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Form card */}
              <div className="bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm text-xs">
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">Send us a Message</h2>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Name</label>
                    <input type="text" className="w-full rounded-lg border border-light-border dark:border-dark-border p-2 focus:outline-none focus:ring-1 focus:ring-brand-primary bg-slate-50 dark:bg-slate-850" placeholder="e.g. Raj" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Email</label>
                    <input type="email" className="w-full rounded-lg border border-light-border dark:border-dark-border p-2 focus:outline-none focus:ring-1 focus:ring-brand-primary bg-slate-50 dark:bg-slate-850" placeholder="e.g. raj@gmail.com" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Message</label>
                    <textarea rows="3" className="w-full rounded-lg border border-light-border dark:border-dark-border p-2 focus:outline-none focus:ring-1 focus:ring-brand-primary bg-slate-50 dark:bg-slate-850 resize-none" placeholder="Details of your request..." />
                  </div>
                  <button 
                    onClick={() => { alert('Thank you for contacting StyleAura. We will reach back to you shortly.'); }}
                    className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2.5 rounded-lg transition-colors"
                  >
                    Submit Query
                  </button>
                </div>
              </div>

              {/* Business Cards details */}
              <div className="space-y-6">
                <div className="bg-slate-100 dark:bg-slate-900 border border-light-border dark:border-dark-border rounded-3xl p-6 space-y-4">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-brand-primary" />
                    Surat Studio Head Office
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-450 leading-relaxed">
                    <strong>{demoBusinessDetails.name}</strong><br />
                    {demoBusinessDetails.address}
                  </p>
                  <div className="divide-y divide-light-border dark:divide-dark-border text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between py-2">
                      <span className="font-bold">Customer Helpline:</span>
                      <span>{demoBusinessDetails.phone}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="font-bold">Support Email:</span>
                      <span>{demoBusinessDetails.email}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="font-bold">Working Hours:</span>
                      <span>{demoBusinessDetails.hours}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center border border-dashed border-light-border dark:border-dark-border rounded-3xl p-6 text-xs text-slate-500 gap-2">
                  <Shield className="h-6 w-6 text-brand-primary" />
                  <span>Your query dispatches securely. Direct response assured in 24 hours.</span>
                </div>

              </div>

            </div>
          </div>
        )}

      </main>

      {/* Elegant Footer */}
      <footer className="border-t border-light-border dark:border-dark-border bg-white dark:bg-slate-950 py-12 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left text-xs text-slate-550 dark:text-slate-400">
            
            <div className="space-y-4">
              <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Style<span className="text-brand-primary">Aura</span> India
              </span>
              <p className="leading-relaxed">
                Premium fashion apparel house catering to contemporary Indian styles. Finely woven in Surat, delivered pan-India.
              </p>
              <div className="flex gap-4 text-slate-400">
                <span className="font-bold text-[9px] border border-slate-300 dark:border-slate-850 px-1 py-0.5 rounded">UPI</span>
                <span className="font-bold text-[9px] border border-slate-300 dark:border-slate-850 px-1 py-0.5 rounded">COD</span>
                <span className="font-bold text-[9px] border border-slate-300 dark:border-slate-850 px-1 py-0.5 rounded">RU PAY</span>
                <span className="font-bold text-[9px] border border-slate-300 dark:border-slate-850 px-1 py-0.5 rounded">CARDS</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-slate-900 dark:text-white font-extrabold uppercase tracking-wider text-[10px]">Collection</h4>
              <ul className="space-y-2">
                <li><button onClick={() => { setCurrentView('shop'); setSelectedCategory('Women'); }} className="hover:text-brand-primary transition-colors">Women Ethnic</button></li>
                <li><button onClick={() => { setCurrentView('shop'); setSelectedCategory('Men'); }} className="hover:text-brand-primary transition-colors">Men Casual Shirts</button></li>
                <li><button onClick={() => { setCurrentView('shop'); setSelectedCategory('Kids'); }} className="hover:text-brand-primary transition-colors">Kids Traditional</button></li>
                <li><button onClick={() => { setCurrentView('shop'); setSelectedCategory('Accessories'); }} className="hover:text-brand-primary transition-colors">Bags &amp; Accessories</button></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-slate-900 dark:text-white font-extrabold uppercase tracking-wider text-[10px]">Customer Service</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300"><PhoneCall className="h-3 w-3 text-brand-primary" /> <span>{demoBusinessDetails.phone}</span></li>
                <li className="flex items-center gap-1 text-[10px] text-slate-455"><Clock className="h-3.5 w-3.5" /> <span>{demoBusinessDetails.hours}</span></li>
                <li><button onClick={() => { setActivePolicyTab('shipping'); setCurrentView('policies'); }} className="hover:text-brand-primary transition-colors">Shipping &amp; Delivery Policy</button></li>
                <li><button onClick={() => { setActivePolicyTab('return'); setCurrentView('policies'); }} className="hover:text-brand-primary transition-colors">Return &amp; Refund Policy</button></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-slate-900 dark:text-white font-extrabold uppercase tracking-wider text-[10px]">Studio</h4>
              <p className="leading-relaxed">
                <strong>{demoBusinessDetails.name}</strong><br />
                {demoBusinessDetails.address}<br />
                Email: {demoBusinessDetails.email}
              </p>
              <div className="flex items-center gap-1 pt-1 text-rose-500 font-semibold">
                <Heart className="h-3.5 w-3.5 fill-rose-500" />
                <span>Designed &amp; Crafted in India</span>
              </div>
            </div>

          </div>

          <div className="border-t border-light-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
            <span>&copy; {new Date().getFullYear()} StyleAura India. All rights reserved. Registered in India.</span>
            <div className="flex gap-4">
              <button onClick={() => { setActivePolicyTab('privacy'); setCurrentView('policies'); }} className="hover:underline">Privacy Policy</button>
              <button onClick={() => { setActivePolicyTab('terms'); setCurrentView('policies'); }} className="hover:underline">Terms &amp; Conditions</button>
              <button onClick={() => setCurrentView('contact')} className="hover:underline">Contact Us</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Drawer sliding sidebar overlay */}
      <CartDrawer onOpenCheckout={() => setCheckoutOpen(true)} />

      {/* Detail Overlays */}
      <QuickViewModal />

      {/* Checkout wizard overlay */}
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

    </div>
  );
}

export default App;
