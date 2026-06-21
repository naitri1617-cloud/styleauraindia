import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ClipboardList, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut, 
  Sun, 
  Moon, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Truck, 
  X, 
  ShieldAlert,
  ChevronDown,
  Calendar,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  Eye
} from 'lucide-react';

function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('styleaura_admin_theme');
    return saved || 'light';
  });

  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('styleaura_admin_token') !== null;
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Tab: 'dashboard', 'products', 'orders', 'customers'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Database States
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [errorData, setErrorData] = useState('');

  // Search & Filter States
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [productStockFilter, setProductStockFilter] = useState('All'); // 'All', 'InStock', 'LowStock'

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  // Modal / Form States
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null for Add, product object for Edit
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Women Ethnic',
    subCategory: 'Kurti',
    stock: '',
    featured: false,
    rating: 5.0,
    reviewsCount: 0,
    gradient: 'from-indigo-100 to-indigo-205',
    textGradient: 'text-indigo-805',
    accentColor: '#8b5cf6',
    description: '',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Mustard Gold', 'Mint Green', 'Ivory White', 'Crimson Red']
  });

  const [orderDetailModal, setOrderDetailModal] = useState(null); // Selected order details

  // Apply Theme
  useEffect(() => {
    localStorage.setItem('styleaura_admin_theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Fetch Database from Express API
  const fetchData = async () => {
    if (!isLoggedIn) return;
    try {
      setLoadingData(true);
      setErrorData('');
      
      const [resProds, resOrders] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders')
      ]);

      if (!resProds.ok || !resOrders.ok) {
        throw new Error('Server API request failed');
      }

      const prods = await resProds.json();
      const ords = await resOrders.json();

      setProducts(prods);
      setOrders(ords);
    } catch (err) {
      console.error(err);
      setErrorData('Could not synchronize database with Express backend API (www.styleauraindia.com).');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isLoggedIn]);

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Authentication failed');
      }

      const data = await res.json();
      localStorage.setItem('styleaura_admin_token', data.token);
      setIsLoggedIn(true);
    } catch (err) {
      setLoginError(err.message || 'Server error during authentication.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('styleaura_admin_token');
    setIsLoggedIn(false);
    setLoginEmail('');
    setLoginPassword('');
  };

  // CRUD API: Add or Edit product
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      alert('Product Name and Price are required');
      return;
    }

    try {
      const isEdit = !!editingProduct;
      const url = isEdit 
        ? `/api/products/${editingProduct.id}` 
        : '/api/products';
      
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock || 0, 10),
          featured: formData.featured
        })
      });

      if (!res.ok) throw new Error('Failed to update product catalog');

      setProductModalOpen(false);
      setEditingProduct(null);
      fetchData(); // reload
    } catch (err) {
      alert(err.message);
    }
  };

  // CRUD API: Delete Product
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product from style catalog?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Delete operation failed');

      fetchData(); // reload
    } catch (err) {
      alert(err.message);
    }
  };

  // CRUD API: Update order dispatch status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Status modification failed');

      fetchData(); // reload
    } catch (err) {
      alert(err.message);
    }
  };

  // Prepare Forms for Modals
  const openAddProductModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      category: 'Women Ethnic',
      subCategory: 'Kurti',
      stock: '25',
      featured: false,
      rating: 5.0,
      reviewsCount: 12,
      gradient: 'from-indigo-100 to-indigo-200',
      textGradient: 'text-indigo-800',
      accentColor: '#8b5cf6',
      description: 'Elegant designer festive wear sourced from organic cotton structures, handworked in Surat.',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Mustard Gold', 'Mint Green', 'Ivory White', 'Crimson Red']
    });
    setProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      subCategory: product.subCategory || 'Kurti',
      stock: product.stock.toString(),
      featured: product.featured || false,
      rating: product.rating || 5.0,
      reviewsCount: product.reviewsCount || 0,
      gradient: product.gradient || 'from-indigo-100 to-indigo-200',
      textGradient: product.textGradient || 'text-indigo-800',
      accentColor: product.accentColor || '#8b5cf6',
      description: product.description || '',
      sizes: product.sizes || ['S', 'M', 'L', 'XL'],
      colors: product.colors || ['Mustard Gold', 'Mint Green', 'Ivory White', 'Crimson Red']
    });
    setProductModalOpen(true);
  };

  // Dashboard Aggregates
  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const processingOrdersCount = orders.filter(o => o.status === 'Processing').length;
  const dispatchedOrdersCount = orders.filter(o => o.status === 'Shipped' || o.status === 'Delivered').length;
  const lowStockCount = products.filter(p => p.stock <= 5).length;

  // Extract Unique Customers List
  const uniqueCustomers = [];
  orders.forEach(o => {
    const phone = o.shippingDetails.phone;
    const exists = uniqueCustomers.find(c => c.phone === phone);
    if (!exists) {
      uniqueCustomers.push({
        name: o.shippingDetails.fullName,
        phone: phone,
        email: o.shippingDetails.email || 'N/A',
        city: o.shippingDetails.city,
        state: o.shippingDetails.state,
        totalOrders: 1,
        totalSpend: o.total
      });
    } else {
      exists.totalOrders += 1;
      exists.totalSpend += o.total;
    }
  });

  // Filter products list
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                          p.category.toLowerCase().includes(productSearch.toLowerCase());
    
    const matchesCategory = productCategoryFilter === 'All' || p.category === productCategoryFilter;
    
    let matchesStock = true;
    if (productStockFilter === 'InStock') matchesStock = p.stock > 5;
    if (productStockFilter === 'LowStock') matchesStock = p.stock <= 5;

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Filter orders list
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          o.shippingDetails.fullName.toLowerCase().includes(orderSearch.toLowerCase()) || 
                          o.shippingDetails.phone.includes(orderSearch);
    
    const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;

    return matchesSearch && matchesStatus;
  });

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200 flex items-center justify-center font-sans transition-colors duration-300 p-4">
        {/* Decorative background glows */}
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-brand-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-brand-accent/5 blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-white/75 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl glass-card backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-3 py-1 rounded-full">
              StyleAura India Portal
            </span>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              Store Owner Log In
            </h1>
            <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
              Access the Surat supply inventory, pricing sheets, and customer order logs.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl p-3 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-655 dark:text-slate-400">Owner Email</label>
              <input
                type="email"
                required
                placeholder="admin@styleauraindia.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full text-xs rounded-xl border border-light-border dark:border-dark-border bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-xs font-bold text-slate-655 dark:text-slate-400">Security Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full text-xs rounded-xl border border-light-border dark:border-dark-border bg-slate-50 dark:bg-slate-950 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {loginLoading ? 'Authenticating credentials...' : 'Enter Dispatch Console'}
            </button>
          </form>
          
          <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-between">
            <span>Demo: admin@styleauraindia.com</span>
            <span>Pass: admin123</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200 flex font-sans transition-colors duration-300">
      
      {/* 1. SIDEBAR */}
      <aside className="w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-light-border dark:border-dark-border flex flex-col justify-between p-6">
        <div className="space-y-8">
          {/* Logo / Header */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-primary to-purple-650 flex items-center justify-center text-white font-black text-sm shadow-md">
              SA
            </div>
            <div className="text-left">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white block tracking-tight">
                Style<span className="text-brand-primary">Aura</span> India
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block -mt-0.5">Admin Desk</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
              { id: 'products', label: 'Style Inventory', icon: ShoppingBag },
              { id: 'orders', label: 'Dispatch Orders', icon: ClipboardList },
              { id: 'customers', label: 'Customers Registry', icon: Users }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-left transition-all ${
                    isActive 
                      ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/10' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="space-y-4 pt-6 border-t border-light-border dark:border-dark-border">
          {/* Theme switcher */}
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-light-border dark:border-dark-border">
            <span className="text-[10px] font-bold text-slate-500 pl-2">Theme Mode</span>
            <div className="flex gap-1">
              <button 
                onClick={() => setTheme('light')} 
                className={`p-1.5 rounded-lg transition-all ${theme === 'light' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-400'}`}
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <button 
                onClick={() => setTheme('dark')} 
                className={`p-1.5 rounded-lg transition-all ${theme === 'dark' ? 'bg-slate-900 text-brand-primary shadow-sm' : 'text-slate-400'}`}
              >
                <Moon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Sync Button */}
          <button 
            onClick={fetchData}
            className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-light-border dark:border-dark-border hover:border-brand-primary text-[10px] font-bold rounded-xl transition-colors hover:text-brand-primary text-slate-500"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Refresh Server API</span>
          </button>

          {/* Log Out */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-455 text-xs font-bold rounded-xl transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Exit Console</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Main Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-light-border dark:border-dark-border flex items-center justify-between px-8 shrink-0">
          <div className="text-left">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white capitalize">
              {activeTab === 'dashboard' ? 'Overview Dashboard' : activeTab === 'products' ? 'Style Catalog & Stock' : activeTab === 'orders' ? 'Customer Dispatch Board' : 'Unique Customer Registry'}
            </h2>
            <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5">
              <Calendar className="h-3 w-3" /> Surat Head Office &middot; {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {errorData && (
              <span className="text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-bold px-3 py-1 rounded-full animate-pulse">
                Offline Mode
              </span>
            )}
            
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-brand-primary text-white flex items-center justify-center text-[10px] font-black uppercase">
                SA
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-slate-905 dark:text-white block -mb-0.5">Administrator</span>
                <span className="text-[8px] text-slate-400 font-semibold block">Surat, Gujarat</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-grow p-8 overflow-y-auto space-y-6">
          {errorData && (
            <div className="border border-dashed border-rose-200 dark:border-rose-900 bg-rose-50/10 dark:bg-rose-950/5 rounded-2xl p-4 text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 shrink-0 text-rose-500" />
              <div>
                <p className="font-extrabold">Data Connection Warning</p>
                <p className="mt-0.5 text-slate-500">{errorData} Please verify `node server/server.js` is running at http://www.styleauraindia.com/.</p>
              </div>
            </div>
          )}

          {loadingData && (
            <div className="py-24 text-center space-y-3">
              <div className="h-8 w-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-bold">Synchronizing ledger logs from Surat server database...</p>
            </div>
          )}

          {!loadingData && (
            <>
              {/* ================= TAB 1: OVERVIEW DASHBOARD ================= */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  
                  {/* Aggregates Cards Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Card 1 */}
                    <div className="bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border p-6 rounded-3xl text-left space-y-2 relative overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gross Sales Revenue</span>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                        ₹{totalRevenue.toLocaleString('en-IN')}
                      </h3>
                      <p className="text-[9px] text-slate-500">Excludes cancelled dispatches</p>
                      <div className="absolute right-4 bottom-4 h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                        ₹
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border p-6 rounded-3xl text-left space-y-2 relative overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Booked Orders</span>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                        {orders.length}
                      </h3>
                      <p className="text-[9px] text-slate-500">{pendingOrdersCount} pending, {processingOrdersCount} process</p>
                      <div className="absolute right-4 bottom-4 h-10 w-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                        <ClipboardList className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border p-6 rounded-3xl text-left space-y-2 relative overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Catalog Inventory</span>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                        {products.length}
                      </h3>
                      <p className="text-[9px] text-slate-500">{lowStockCount} items running low stock</p>
                      <div className="absolute right-4 bottom-4 h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border p-6 rounded-3xl text-left space-y-2 relative overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Low Stock Alert</span>
                      <h3 className={`text-2xl font-black ${lowStockCount > 0 ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
                        {lowStockCount}
                      </h3>
                      <p className="text-[9px] text-slate-500">Requires Surat factory re-order</p>
                      <div className={`absolute right-4 bottom-4 h-10 w-10 rounded-xl flex items-center justify-center ${lowStockCount > 0 ? 'bg-amber-500/10 text-amber-550' : 'bg-slate-100 text-slate-400'}`}>
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  {/* Charts & Breakdown panels */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Dispatch Breakdown */}
                    <div className="bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border p-6 rounded-3xl space-y-4 text-left shadow-sm">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Dispatch Queue Status</h3>
                      <div className="space-y-3 pt-2">
                        {[
                          { label: 'Pending Dispatch', count: pendingOrdersCount, color: 'bg-amber-550', val: orders.length ? (pendingOrdersCount/orders.length)*100 : 0 },
                          { label: 'Processing Line', count: processingOrdersCount, color: 'bg-indigo-500', val: orders.length ? (processingOrdersCount/orders.length)*100 : 0 },
                          { label: 'Shipped / Delivered', count: dispatchedOrdersCount, color: 'bg-emerald-500', val: orders.length ? (dispatchedOrdersCount/orders.length)*100 : 0 },
                          { label: 'Cancelled orders', count: orders.filter(o => o.status === 'Cancelled').length, color: 'bg-rose-500', val: orders.length ? (orders.filter(o => o.status === 'Cancelled').length/orders.length)*100 : 0 }
                        ].map((stat, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-[11px] font-semibold">
                              <span className="text-slate-600 dark:text-slate-400">{stat.label}</span>
                              <span className="text-slate-900 dark:text-white font-bold">{stat.count} ({Math.round(stat.val)}%)</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                              <div className={`h-full ${stat.color} rounded-full`} style={{ width: `${stat.val}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sales by Category */}
                    <div className="bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border p-6 rounded-3xl space-y-4 text-left shadow-sm">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Sales Categories Sizing</h3>
                      <div className="space-y-3 pt-2">
                        {['Women Ethnic', 'Men Casuals', 'Kids Traditional', 'Bags & Accessories'].map((cat, idx) => {
                          const categoryOrders = orders.filter(o => o.status !== 'Cancelled').flatMap(o => o.items).filter(item => item.product.category === cat);
                          const totalQuantity = categoryOrders.reduce((sum, item) => sum + item.quantity, 0);
                          const totalRevenueCat = categoryOrders.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
                          const maxCatSpend = orders.filter(o => o.status !== 'Cancelled').flatMap(o => o.items).reduce((sum, item) => sum + item.quantity, 0) || 1;
                          const percent = Math.round((totalQuantity / maxCatSpend) * 100);

                          const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-pink-500'];

                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-[11px] font-semibold">
                                <span className="text-slate-650 dark:text-slate-400">{cat}</span>
                                <span className="text-slate-900 dark:text-white font-bold">₹{totalRevenueCat.toLocaleString('en-IN')} ({totalQuantity} pcs)</span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                                <div className={`h-full ${colors[idx % colors.length]} rounded-full`} style={{ width: `${percent}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Inventory alerts */}
                    <div className="bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border p-6 rounded-3xl space-y-4 text-left shadow-sm">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <AlertTriangle className="h-4.5 w-4.5 text-amber-550" />
                        Low Stock Factory Alert
                      </h3>
                      <div className="divide-y divide-light-border dark:divide-dark-border max-h-[170px] overflow-y-auto pr-1">
                        {products.filter(p => p.stock <= 5).length > 0 ? (
                          products.filter(p => p.stock <= 5).map((prod) => (
                            <div key={prod.id} className="py-2.5 flex justify-between items-center text-xs">
                              <div className="truncate pr-4">
                                <span className="font-bold text-slate-800 dark:text-slate-205 block truncate max-w-[150px]">{prod.name}</span>
                                <span className="text-[9px] text-slate-400 font-semibold">{prod.category}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${prod.stock === 0 ? 'bg-rose-500/10 text-rose-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                  {prod.stock} left
                                </span>
                                <button
                                  onClick={() => openEditProductModal(prod)}
                                  className="p-1 hover:bg-slate-105 rounded text-slate-400 hover:text-brand-primary"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-12 text-center text-xs text-slate-400 font-semibold flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            All catalog stock levels healthy!
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Recent Orders log */}
                  <div className="bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border rounded-3xl p-6 text-left space-y-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Recent Customer Purchases</h3>
                      <button 
                        onClick={() => setActiveTab('orders')}
                        className="text-xs text-brand-primary font-bold hover:underline"
                      >
                        View Dispatch Board
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs divide-y divide-light-border dark:divide-dark-border">
                        <thead>
                          <tr className="text-slate-400 font-bold">
                            <th className="pb-3">Reference ID</th>
                            <th className="pb-3">Booked Date</th>
                            <th className="pb-3">Customer</th>
                            <th className="pb-3">Destination City</th>
                            <th className="pb-3">Ordered Item count</th>
                            <th className="pb-3">Total Amount</th>
                            <th className="pb-3">Status</th>
                            <th className="pb-3 text-right">Console actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-light-border dark:divide-dark-border">
                          {orders.slice(0, 5).map((order) => (
                            <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                              <td className="py-3.5 font-extrabold text-brand-primary tracking-wider">{order.id}</td>
                              <td className="py-3.5 text-slate-550 dark:text-slate-400 font-semibold">{order.date.split(',')[0]}</td>
                              <td className="py-3.5 font-bold text-slate-900 dark:text-white">{order.shippingDetails.fullName}</td>
                              <td className="py-3.5 font-semibold text-slate-600 dark:text-slate-400">{order.shippingDetails.city}</td>
                              <td className="py-3.5 text-center font-bold">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</td>
                              <td className="py-3.5 font-extrabold text-slate-900 dark:text-white">₹{order.total.toLocaleString('en-IN')}</td>
                              <td className="py-3.5">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  order.status === 'Delivered'
                                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                    : order.status === 'Shipped'
                                    ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                                    : order.status === 'Cancelled'
                                    ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                                    : order.status === 'Processing'
                                    ? 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20'
                                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-3.5 text-right flex justify-end gap-2">
                                <button
                                  onClick={() => setOrderDetailModal(order)}
                                  className="p-1 hover:bg-slate-105 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <select
                                  value={order.status}
                                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                  className="text-[10px] bg-slate-50 dark:bg-slate-850 border border-light-border dark:border-dark-border rounded px-2 py-0.5 focus:outline-none"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                          {orders.length === 0 && (
                            <tr>
                              <td colSpan="8" className="py-8 text-center text-slate-400 font-semibold italic">No recent customer orders found in system.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* ================= TAB 2: STYLE INVENTORY ================= */}
              {activeTab === 'products' && (
                <div className="space-y-6">
                  
                  {/* Filters and Add button */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border p-4 rounded-3xl">
                    <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
                      
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search product..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="pl-9 pr-3 py-2 text-xs w-[180px] rounded-xl border border-light-border dark:border-dark-border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                        />
                      </div>

                      {/* Category filter */}
                      <select
                        value={productCategoryFilter}
                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                        className="text-xs bg-slate-50 dark:bg-slate-950 border border-light-border dark:border-dark-border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      >
                        <option value="All">All Categories</option>
                        <option value="Women Ethnic">Women Ethnic</option>
                        <option value="Men Casuals">Men Casuals</option>
                        <option value="Kids Traditional">Kids Traditional</option>
                        <option value="Bags & Accessories">Bags & Accessories</option>
                      </select>

                      {/* Stock filter */}
                      <select
                        value={productStockFilter}
                        onChange={(e) => setProductStockFilter(e.target.value)}
                        className="text-xs bg-slate-50 dark:bg-slate-950 border border-light-border dark:border-dark-border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      >
                        <option value="All">All Stocks</option>
                        <option value="InStock">In Stock ({'>'}5)</option>
                        <option value="LowStock">Low / Out of Stock</option>
                      </select>
                    </div>

                    <button
                      onClick={openAddProductModal}
                      className="rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold px-4 py-2 flex items-center gap-1.5 shadow-md shrink-0 w-full sm:w-auto justify-center"
                    >
                      <Plus className="h-4.5 w-4.5" /> Add New Style Product
                    </button>
                  </div>

                  {/* Inventory Table Grid */}
                  <div className="bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border rounded-3xl p-6 text-left shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs divide-y divide-light-border dark:divide-dark-border">
                        <thead>
                          <tr className="text-slate-400 font-bold">
                            <th className="pb-3">Product Image / Mockup</th>
                            <th className="pb-3">Product Code ID</th>
                            <th className="pb-3">Product Title Name</th>
                            <th className="pb-3">Market Category</th>
                            <th className="pb-3">Stock Units</th>
                            <th className="pb-3">MRP Price</th>
                            <th className="pb-3">Review Score</th>
                            <th className="pb-3 text-right">Console actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-light-border dark:divide-dark-border">
                          {filteredProducts.map((prod) => (
                            <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                              
                              <td className="py-3">
                                <div className="h-11 w-11 rounded-lg border border-slate-205 dark:border-slate-800 flex items-center justify-center relative overflow-hidden shadow-inner shrink-0 bg-slate-100 dark:bg-slate-950">
                                  {prod.image ? (
                                    <img 
                                      src={prod.image} 
                                      alt={prod.name} 
                                      className="absolute inset-0 w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        const p = e.target.parentElement.querySelector('.fallback-placeholder');
                                        if (p) p.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div 
                                    className="fallback-placeholder absolute inset-0 bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center"
                                    style={{ display: prod.image ? 'none' : 'flex' }}
                                  >
                                    <span className={`text-[8px] font-black tracking-tighter ${prod.textGradient || 'text-indigo-800'} select-none uppercase`}>
                                      {prod.subCategory || prod.category.split(' ')[0]}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 font-semibold text-slate-400">{prod.id}</td>
                              
                              <td className="py-3">
                                <span className="font-extrabold text-slate-900 dark:text-white block">{prod.name}</span>
                                {prod.featured && (
                                  <span className="inline-block text-[8px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.2 rounded mt-0.5">
                                    ★ Featured Favorite
                                  </span>
                                )}
                              </td>

                              <td className="py-3 font-semibold text-slate-600 dark:text-slate-400">
                                {prod.category} <span className="text-[10px] text-slate-400 font-normal">({prod.subCategory})</span>
                              </td>

                              <td className="py-3 font-bold">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                                  prod.stock === 0 
                                    ? 'bg-rose-500/10 text-rose-600 font-extrabold' 
                                    : prod.stock <= 5 
                                    ? 'bg-amber-500/10 text-amber-600 font-bold'
                                    : 'bg-emerald-500/10 text-emerald-600'
                                }`}>
                                  {prod.stock === 0 ? 'Out of Stock' : `${prod.stock} units`}
                                </span>
                              </td>

                              <td className="py-3 font-extrabold text-slate-905 dark:text-white">₹{prod.price.toLocaleString('en-IN')}</td>
                              
                              <td className="py-3">
                                <div className="flex items-center gap-1">
                                  <span className="font-bold text-slate-900 dark:text-white">{prod.rating}</span>
                                  <span className="text-[10px] text-slate-400">({prod.reviewsCount} reviews)</span>
                                </div>
                              </td>

                              <td className="py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => openEditProductModal(prod)}
                                    className="p-1.5 hover:bg-indigo-500/10 hover:text-brand-primary text-slate-400 rounded-lg transition-colors"
                                    title="Edit product"
                                  >
                                    <Edit className="h-4.5 w-4.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(prod.id)}
                                    className="p-1.5 hover:bg-rose-500/10 hover:text-rose-600 text-slate-400 rounded-lg transition-colors"
                                    title="Delete product"
                                  >
                                    <Trash2 className="h-4.5 w-4.5" />
                                  </button>
                                </div>
                              </td>

                            </tr>
                          ))}
                          {filteredProducts.length === 0 && (
                            <tr>
                              <td colSpan="8" className="py-12 text-center text-slate-400 font-semibold italic">No products match the selected filters or search text.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* ================= TAB 3: DISPATCH ORDERS BOARD ================= */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border p-4 rounded-3xl">
                    <div className="relative w-full sm:w-[250px]">
                      <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search order ID, Client name..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="pl-9 pr-3 py-2 text-xs w-full rounded-xl border border-light-border dark:border-dark-border bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                      />
                    </div>

                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="text-xs bg-slate-50 dark:bg-slate-950 border border-light-border dark:border-dark-border rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-primary w-full sm:w-[180px]"
                    >
                      <option value="All">All Order Statuses</option>
                      <option value="Pending">Pending (Unfulfilled)</option>
                      <option value="Processing">Processing (Dispatched prep)</option>
                      <option value="Shipped">Shipped (In transit)</option>
                      <option value="Delivered">Delivered (Completed)</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Orders Expanded Cards List */}
                  <div className="space-y-4 text-left">
                    {filteredOrders.map((order) => (
                      <div 
                        key={order.id} 
                        className="bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border rounded-3xl p-6 flex flex-col lg:flex-row justify-between gap-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                      >
                        {/* Order Header & Customer block */}
                        <div className="space-y-4 max-w-sm">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-extrabold text-brand-primary tracking-wider">{order.id}</span>
                            <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> Booked: {order.date}
                            </span>
                          </div>

                          <div className="space-y-1 bg-slate-50 dark:bg-slate-955 p-3 rounded-xl text-xs">
                            <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Customer &amp; Shipping Destination</span>
                            <span className="font-extrabold text-slate-900 dark:text-white block mt-1">{order.shippingDetails.fullName}</span>
                            <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                              {order.shippingDetails.address}, {order.shippingDetails.city}, {order.shippingDetails.state} - <span className="font-bold">{order.shippingDetails.postcode}</span>
                            </p>
                            <div className="flex gap-4 pt-1.5 text-slate-500 font-semibold text-[10px]">
                              <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-brand-primary" /> {order.shippingDetails.phone}</span>
                              {order.shippingDetails.email && (
                                <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-brand-primary" /> {order.shippingDetails.email}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Order items lists block */}
                        <div className="flex-1 space-y-2 lg:px-6">
                          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Purchased Styles</span>
                          <div className="divide-y divide-light-border dark:divide-dark-border max-h-[150px] overflow-y-auto pr-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="py-2 flex justify-between items-center text-xs">
                                <div>
                                  <span className="font-extrabold text-slate-800 dark:text-slate-200">
                                    {item.product.name}
                                  </span>
                                  <div className="flex gap-2 text-[10px] text-slate-400 mt-0.5 font-semibold">
                                    <span>Size: {item.selectedSize}</span>
                                    <span>Color: {item.selectedColor}</span>
                                  </div>
                                </div>
                                <span className="text-slate-600 dark:text-slate-455 font-bold shrink-0 pl-4">
                                  {item.quantity} x ₹{item.product.price.toLocaleString('en-IN')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Billing and Status actions block */}
                        <div className="w-full lg:w-[220px] bg-slate-50/50 dark:bg-slate-950/40 p-4 border border-light-border dark:border-dark-border rounded-2xl flex flex-col justify-between text-xs gap-4">
                          <div className="space-y-1">
                            <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Billing Summary</span>
                            <div className="flex justify-between text-[11px] pt-1">
                              <span className="text-slate-500">Items Subtotal:</span>
                              <span className="font-bold">₹{order.subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-500">Shipping (COD/UPI):</span>
                              <span className="font-bold">{order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}</span>
                            </div>
                            {order.discount > 0 && (
                              <div className="flex justify-between text-[11px] text-emerald-600">
                                <span className="font-bold">Discount ({order.couponApplied}):</span>
                                <span>- ₹{order.discount.toLocaleString('en-IN')}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-1.5 mt-1">
                              <span>Total MRP Pay:</span>
                              <span>₹{order.total.toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wider block">Status &amp; Dispatch Line</span>
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className={`w-full text-xs font-bold rounded-lg border p-2 focus:outline-none ${
                                order.status === 'Delivered'
                                  ? 'bg-emerald-500/10 text-emerald-605 border-emerald-500/20'
                                  : order.status === 'Shipped'
                                  ? 'bg-blue-500/10 text-blue-605 border-blue-500/20'
                                  : order.status === 'Cancelled'
                                  ? 'bg-rose-500/10 text-rose-605 border-rose-500/20'
                                  : order.status === 'Processing'
                                  ? 'bg-indigo-500/10 text-indigo-605 border-indigo-500/20'
                                  : 'bg-amber-500/10 text-amber-605 border-amber-500/20'
                              }`}
                            >
                              <option value="Pending">Pending (Unfulfilled)</option>
                              <option value="Processing">Processing (Packaging)</option>
                              <option value="Shipped">Shipped (In transit)</option>
                              <option value="Delivered">Delivered (Received)</option>
                              <option value="Cancelled">Cancelled (Rejected)</option>
                            </select>
                          </div>
                        </div>

                      </div>
                    ))}
                    {filteredOrders.length === 0 && (
                      <div className="bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border p-12 text-center text-slate-400 font-semibold italic rounded-3xl">
                        No customer orders match search query or dispatch status filter.
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* ================= TAB 4: UNIQUE CUSTOMER REGISTRY ================= */}
              {activeTab === 'customers' && (
                <div className="space-y-6">
                  
                  {/* Registry count card */}
                  <div className="bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border p-4 rounded-3xl flex justify-between items-center text-left">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Active Customers</h3>
                      <p className="text-[10px] text-slate-400 font-semibold">Listing unique clients that completed checkout purchases</p>
                    </div>
                    <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-full">
                      {uniqueCustomers.length} Verified Accounts
                    </span>
                  </div>

                  {/* Customer Registry Table */}
                  <div className="bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border rounded-3xl p-6 text-left shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs divide-y divide-light-border dark:divide-dark-border">
                        <thead>
                          <tr className="text-slate-400 font-bold">
                            <th className="pb-3">Client Full Name</th>
                            <th className="pb-3">Mobile Contact (+91)</th>
                            <th className="pb-3">Billing Email Address</th>
                            <th className="pb-3">State / City Location</th>
                            <th className="pb-3">Cumulative Orders</th>
                            <th className="pb-3">Cumulative Spend (INR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-light-border dark:divide-dark-border">
                          {uniqueCustomers.map((cust, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                              <td className="py-3.5 flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-indigo-500/10 text-brand-primary flex items-center justify-center font-bold text-xs">
                                  {cust.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <span className="font-extrabold text-slate-900 dark:text-white">{cust.name}</span>
                              </td>
                              <td className="py-3.5 text-slate-600 dark:text-slate-400 font-semibold">{cust.phone}</td>
                              <td className="py-3.5 font-semibold text-slate-500">{cust.email}</td>
                              <td className="py-3.5">
                                <span className="font-bold text-slate-800 dark:text-slate-205">{cust.city}</span>, <span className="text-slate-400 font-medium">{cust.state}</span>
                              </td>
                              <td className="py-3.5 font-bold text-center">{cust.totalOrders} checkouts</td>
                              <td className="py-3.5 font-extrabold text-slate-900 dark:text-white">₹{cust.totalSpend.toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                          {uniqueCustomers.length === 0 && (
                            <tr>
                              <td colSpan="6" className="py-12 text-center text-slate-400 font-semibold italic">No customer profiles recorded in the system database yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}
            </>
          )}
        </div>

      </main>

      {/* ================= MODAL 1: ADD / EDIT PRODUCT MODAL ================= */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden text-left flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-light-border dark:border-dark-border flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <div>
                <h3 className="text-base font-extrabold text-slate-905 dark:text-white">
                  {editingProduct ? 'Modify Style Catalog' : 'Draft New Style Concept'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Surat factory inventory listing sheets</p>
              </div>
              <button 
                onClick={() => setProductModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body / Scroll Form */}
            <form onSubmit={handleProductSubmit} className="flex-grow p-6 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-655 dark:text-slate-400">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cotton Anarkali Festive Dress"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs rounded-xl border border-light-border dark:border-dark-border bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>

                {/* Categories */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-655 dark:text-slate-400">Category Sourcing *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs rounded-xl border border-light-border dark:border-dark-border bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  >
                    <option value="Women Ethnic">Women Ethnic</option>
                    <option value="Men Casuals">Men Casuals</option>
                    <option value="Kids Traditional">Kids Traditional</option>
                    <option value="Bags & Accessories">Bags & Accessories</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Price */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-655 dark:text-slate-400">MRP Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="1299"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full text-xs rounded-xl border border-light-border dark:border-dark-border bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>

                {/* Stock */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-655 dark:text-slate-400">Stock Count *</label>
                  <input
                    type="number"
                    required
                    placeholder="25"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full text-xs rounded-xl border border-light-border dark:border-dark-border bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>

                {/* Subcategory */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-655 dark:text-slate-400">Sub-Category *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kurti, linen, bag"
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    className="w-full text-xs rounded-xl border border-light-border dark:border-dark-border bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-655 dark:text-slate-400">Catalog Description</label>
                <textarea
                  rows="2"
                  placeholder="Detail the fabric texture, styling cues, wash suggestions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs rounded-xl border border-light-border dark:border-dark-border bg-slate-50 dark:bg-slate-950 p-3.5 focus:outline-none focus:ring-1 focus:ring-brand-primary resize-none"
                />
              </div>

              {/* Graphic Mock Design details */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-light-border dark:border-dark-border space-y-3">
                <span className="text-[10px] text-brand-primary font-bold uppercase tracking-wider block">Visual Gradient Mockup Config</span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-[10px] text-slate-500">Card Gradient (Tailwind Class)</label>
                    <input
                      type="text"
                      placeholder="from-rose-100 to-rose-200"
                      value={formData.gradient}
                      onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                      className="w-full text-[10px] rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-slate-900 px-3 py-2 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[10px] text-slate-500">Text Color Class</label>
                    <input
                      type="text"
                      placeholder="text-rose-800"
                      value={formData.textGradient}
                      onChange={(e) => setFormData({ ...formData, textGradient: e.target.value })}
                      className="w-full text-[10px] rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-slate-900 px-3 py-2 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[10px] text-slate-500">Accent Color Hex</label>
                    <input
                      type="text"
                      placeholder="#f43f5e"
                      value={formData.accentColor}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      className="w-full text-[10px] rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-slate-900 px-3 py-2 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex gap-6 items-center">
                <label className="flex items-center gap-2 font-bold text-slate-655 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded border-light-border dark:border-dark-border text-brand-primary focus:ring-brand-primary h-4 w-4"
                  />
                  <span>Featured Favorite (Show on Homepage)</span>
                </label>
              </div>

              {/* Action buttons */}
              <div className="border-t border-light-border dark:border-dark-border pt-4 flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="rounded-xl border border-light-border dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 font-bold px-5 py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white font-bold px-5 py-2.5 shadow-md shadow-brand-primary/10"
                >
                  {editingProduct ? 'Commit Changes' : 'Catalog New Style'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: ORDER DETAILS EXPANDED DIALOG ================= */}
      {orderDetailModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden text-left flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-light-border dark:border-dark-border flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <div>
                <h3 className="text-base font-extrabold text-slate-905 dark:text-white">
                  Order Invoice: <span className="text-brand-primary tracking-wider">{orderDetailModal.id}</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Recorded on {orderDetailModal.date}</p>
              </div>
              <button 
                onClick={() => setOrderDetailModal(null)}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* Stepper dispatch summary */}
              <div className="bg-slate-550/5 dark:bg-slate-950/40 p-4 border border-light-border dark:border-dark-border rounded-2xl flex justify-between items-center">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Current Dispatch Line</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">{orderDetailModal.status} status</span>
                </div>
                <select
                  value={orderDetailModal.status}
                  onChange={(e) => {
                    handleUpdateOrderStatus(orderDetailModal.id, e.target.value);
                    setOrderDetailModal({ ...orderDetailModal, status: e.target.value });
                  }}
                  className="bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border text-xs rounded-lg px-2.5 py-1 focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Customer summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-400 uppercase font-black block">Recipient Details</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{orderDetailModal.shippingDetails.fullName}</p>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1"><Phone className="h-3 w-3" /> {orderDetailModal.shippingDetails.phone}</p>
                  {orderDetailModal.shippingDetails.email && (
                    <p className="text-[10px] text-slate-500 flex items-center gap-1"><Mail className="h-3 w-3" /> {orderDetailModal.shippingDetails.email}</p>
                  )}
                </div>

                <div className="space-y-1.5 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                  <span className="text-[9px] text-slate-400 uppercase font-black block">Surat Logistics Destination</span>
                  <p className="text-slate-600 dark:text-slate-400">
                    {orderDetailModal.shippingDetails.address},<br />
                    {orderDetailModal.shippingDetails.city}, {orderDetailModal.shippingDetails.state} - <span className="font-extrabold">{orderDetailModal.shippingDetails.postcode}</span>
                  </p>
                </div>
              </div>

              {/* Items lists */}
              <div className="border-t border-light-border dark:border-dark-border pt-4">
                <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block mb-2">Invoice line items</span>
                <div className="divide-y divide-light-border dark:divide-dark-border border border-light-border dark:border-dark-border rounded-2xl overflow-hidden bg-slate-50/20 dark:bg-slate-950/20">
                  {orderDetailModal.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">{item.product.name}</span>
                        <div className="flex gap-2 text-[10px] text-slate-400 font-semibold mt-0.5">
                          <span>Size: {item.selectedSize}</span>
                          <span>Color: {item.selectedColor}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold block text-slate-800 dark:text-slate-200">
                          {item.quantity} x ₹{item.product.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold block">
                          Total: ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial calculations sheet */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-light-border dark:border-dark-border rounded-2xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-550">Items Subtotal:</span>
                  <span className="font-bold">₹{orderDetailModal.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-550">Logistics Shipping:</span>
                  <span className="font-bold">{orderDetailModal.shipping === 0 ? 'FREE' : `₹${orderDetailModal.shipping}`}</span>
                </div>
                {orderDetailModal.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount Code Applied ({orderDetailModal.couponApplied}):</span>
                    <span className="font-bold">- ₹{orderDetailModal.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white border-t border-slate-205 dark:border-slate-800 pt-2 mt-2">
                  <span>Gross Pay amount:</span>
                  <span>₹{orderDetailModal.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Close action */}
              <div className="border-t border-light-border dark:border-dark-border pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setOrderDetailModal(null)}
                  className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold px-5 py-2.5 hover:bg-slate-800"
                >
                  Close Invoice
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default App;
