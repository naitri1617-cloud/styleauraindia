import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Products state (fetched from backend API)
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [apiError, setApiError] = useState('');

  // Cart state (local persistence)
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('styleaura_customer_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Track Order details states
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');

  // Helper to parse location pathname for initial view/category state
  const getInitialStateFromPath = () => {
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
    if (path === '/kids') {
      return { view: 'shop', category: 'Kids' };
    } else if (path === '/men') {
      return { view: 'shop', category: 'Men' };
    } else if (path === '/women') {
      return { view: 'shop', category: 'Women' };
    } else if (path === '/accessories') {
      return { view: 'shop', category: 'Accessories' };
    } else if (path === '/beauty') {
      return { view: 'shop', category: 'Beauty' };
    } else if (path === '/sale') {
      return { view: 'shop', category: 'Sale' };
    } else if (path === '/shop') {
      return { view: 'shop', category: 'All' };
    } else if (path === '/track-order') {
      return { view: 'track-order', category: 'All' };
    } else if (path === '/my-account') {
      return { view: 'my-account', category: 'All' };
    } else if (path === '/policies') {
      return { view: 'policies', category: 'All' };
    } else if (path === '/contact') {
      return { view: 'contact', category: 'All' };
    }
    return { view: 'home', category: 'All' };
  };

  const initialState = getInitialStateFromPath();
  const [currentView, setCurrentView] = useState(initialState.view);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialState.category);

  // Sync state to URL pathname
  useEffect(() => {
    let targetPath = '/';
    if (currentView === 'shop') {
      if (selectedCategory === 'Kids') targetPath = '/kids';
      else if (selectedCategory === 'Men') targetPath = '/men';
      else if (selectedCategory === 'Women') targetPath = '/women';
      else if (selectedCategory === 'Accessories') targetPath = '/accessories';
      else if (selectedCategory === 'Beauty') targetPath = '/beauty';
      else if (selectedCategory === 'Sale') targetPath = '/sale';
      else targetPath = '/shop';
    } else if (currentView === 'track-order') {
      targetPath = '/track-order';
    } else if (currentView === 'my-account') {
      targetPath = '/my-account';
    } else if (currentView === 'policies') {
      targetPath = '/policies';
    } else if (currentView === 'contact') {
      targetPath = '/contact';
    }

    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  }, [currentView, selectedCategory]);

  // Listen for browser popstate
  useEffect(() => {
    const handlePopState = () => {
      const state = getInitialStateFromPath();
      setCurrentView(state.view);
      setSelectedCategory(state.category);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  // Theme state: "dark" or "light"
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('styleaura_theme');
    return saved || 'light';
  });

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Fetch products from server on mount or view change
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      setProducts(data);
      setApiError('');
    } catch (err) {
      console.error(err);
      setApiError('Unable to connect to StyleAura API. Make sure the server is running at http://www.styleauraindia.com/.');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentView]); // Re-fetch on view changes to show updated catalog items

  // Persist cart
  useEffect(() => {
    localStorage.setItem('styleaura_customer_cart', JSON.stringify(cart));
  }, [cart]);

  // Persist and apply theme
  useEffect(() => {
    localStorage.setItem('styleaura_theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Cart operations
  const addToCart = (product, size, color, quantity = 1) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      }

      return [...prevCart, { product, selectedSize: size, selectedColor: color, quantity }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (productId, size, color) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(item.product.id === productId && item.selectedSize === size && item.selectedColor === color)
      )
    );
  };

  const updateCartQuantity = (productId, size, color, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId && item.selectedSize === size && item.selectedColor === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Coupons
  const applyCoupon = (code) => {
    const cleanCode = code.toUpperCase().trim();
    if (cleanCode === 'STYLE10') {
      setAppliedCoupon({ code: 'STYLE10', discount: 0.10, type: 'percent' });
      setCouponError('');
      return true;
    } else if (cleanCode === 'INDIA20') {
      setAppliedCoupon({ code: 'INDIA20', discount: 0.20, type: 'percent' });
      setCouponError('');
      return true;
    } else if (cleanCode === 'FREESHIP') {
      setAppliedCoupon({ code: 'FREESHIP', discount: 99.00, type: 'shipping' });
      setCouponError('');
      return true;
    } else {
      setCouponError('Invalid coupon code. Try STYLE10 or INDIA20!');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // Checkout & Order creation - POST to backend
  const handleCheckout = async (shippingDetails) => {
    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const isFreeShipping = subtotal >= 999.00 || appliedCoupon?.code === 'FREESHIP';
    const shipping = isFreeShipping ? 0 : 99;
    
    let discountAmount = 0;
    if (appliedCoupon?.type === 'percent') {
      discountAmount = subtotal * appliedCoupon.discount;
    } else if (appliedCoupon?.type === 'shipping') {
      discountAmount = 99.00;
    }

    const total = subtotal + shipping - discountAmount;

    const orderPayload = {
      items: cart.map(item => ({
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          category: item.product.category,
          subCategory: item.product.subCategory,
          gradient: item.product.gradient,
          textGradient: item.product.textGradient
        },
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        quantity: item.quantity
      })),
      shippingDetails,
      subtotal,
      shipping,
      discount: discountAmount,
      total,
      couponApplied: appliedCoupon ? appliedCoupon.code : null
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) throw new Error('Order placement failed');
      const order = await res.json();
      clearCart();
      fetchProducts(); // Refresh stocks on catalog
      return order;
    } catch (err) {
      console.error(err);
      throw new Error('Unable to submit order. Please check API server connection.');
    }
  };

  // Order Tracking API - GET /api/orders/:id
  const trackOrder = async (queryParam) => {
    if (!queryParam.trim()) {
      setTrackingError('Order ID or Mobile number is required');
      return;
    }

    try {
      setTrackingLoading(true);
      setTrackingError('');
      setTrackedOrder(null);
      
      const res = await fetch(`/api/orders/${encodeURIComponent(queryParam)}`);
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('No active order matches this Reference ID or Mobile number.');
        }
        throw new Error('Failed to query order records.');
      }
      
      const data = await res.json();
      setTrackedOrder(data);
    } catch (err) {
      console.error(err);
      setTrackingError(err.message || 'Error tracking your order.');
    } finally {
      setTrackingLoading(false);
    }
  };

  // Theme Management
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <CartContext.Provider
      value={{
        products,
        loadingProducts,
        apiError,
        cart,
        currentView,
        setCurrentView,
        selectedProduct,
        setSelectedProduct,
        selectedCategory,
        setSelectedCategory,
        cartOpen,
        setCartOpen,
        searchQuery,
        setSearchQuery,
        theme,
        toggleTheme,
        appliedCoupon,
        couponError,
        applyCoupon,
        removeCoupon,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        handleCheckout,
        trackOrder,
        trackedOrder,
        setTrackedOrder,
        trackingLoading,
        trackingError,
        fetchProducts
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
