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

  // UI View States: "home", "shop", "track-order", "contact", "policies", "my-account"
  const [currentView, setCurrentView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
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
