import React, { useState, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { X, CheckCircle, ArrowRight, ArrowLeft, CreditCard, Shield, Smartphone, Landmark } from 'lucide-react';

const CheckoutModal = ({ isOpen, onClose }) => {
  const { cart, handleCheckout, appliedCoupon } = useContext(CartContext);
  
  const [step, setStep] = useState(1); // 1: Delivery, 2: Payment, 3: Confirmation
  
  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    houseFlat: '',
    streetArea: '',
    city: '',
    state: 'Gujarat',
    postcode: '',
  });

  const [paymentDetails, setPaymentDetails] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    method: 'cod',
    upiId: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [createdOrder, setCreatedOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const indianStates = [
    "Gujarat", "Maharashtra", "Rajasthan", "Delhi", "Karnataka", 
    "Tamil Nadu", "Uttar Pradesh", "Madhya Pradesh", "West Bengal", 
    "Punjab", "Haryana", "Kerala", "Telangana"
  ];

  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isFreeShipping = subtotal >= 999.00 || appliedCoupon?.code === 'FREESHIP';
  const shippingFee = isFreeShipping ? 0.00 : 99.00;
  
  let discountAmount = 0;
  if (appliedCoupon?.type === 'percent') {
    discountAmount = subtotal * appliedCoupon.discount;
  } else if (appliedCoupon?.type === 'shipping') {
    discountAmount = 99.00;
  }
  const finalTotal = subtotal + shippingFee - discountAmount;

  const validateStep1 = () => {
    const errors = {};
    if (!shippingDetails.fullName.trim()) errors.fullName = 'Full Name is required';
    if (!shippingDetails.email.trim() || !/\S+@\S+\.\S+/.test(shippingDetails.email)) {
      errors.email = 'A valid email is required';
    }
    
    const mobileRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
    if (!shippingDetails.phone.trim()) {
      errors.phone = 'Mobile Number is required';
    } else if (!mobileRegex.test(shippingDetails.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit Indian Mobile Number';
    }

    if (!shippingDetails.houseFlat.trim()) errors.houseFlat = 'House / Flat / Building details are required';
    if (!shippingDetails.streetArea.trim()) errors.streetArea = 'Street / Area details are required';
    if (!shippingDetails.city.trim()) errors.city = 'City is required';
    if (!shippingDetails.state) errors.state = 'State selection is required';
    
    const pinRegex = /^[1-9][0-9]{5}$/;
    if (!shippingDetails.postcode.trim()) {
      errors.postcode = 'PIN Code is required';
    } else if (!pinRegex.test(shippingDetails.postcode.trim())) {
      errors.postcode = 'Please enter a valid 6-digit Indian PIN Code';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    
    if (paymentDetails.method === 'card') {
      if (!paymentDetails.cardName.trim()) errors.cardName = 'Name on card is required';
      if (!paymentDetails.cardNumber.trim() || paymentDetails.cardNumber.replace(/\s/g, '').length !== 16) {
        errors.cardNumber = 'A valid 16-digit card number is required';
      }
      if (!paymentDetails.expiry.trim() || !/^\d{2}\/\d{2}$/.test(paymentDetails.expiry)) {
        errors.expiry = 'Expiry date (MM/YY) is required';
      }
      if (!paymentDetails.cvv.trim() || paymentDetails.cvv.length !== 3) {
        errors.cvv = '3-digit CVV is required';
      }
    } else if (paymentDetails.method === 'upi') {
      if (!paymentDetails.upiId.trim() || !paymentDetails.upiId.includes('@')) {
        errors.upiId = 'Please enter a valid UPI ID (e.g. name@upi)';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = async () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
        setFormErrors({});
      }
    } else if (step === 2) {
      if (validateStep2()) {
        try {
          setErrorMessage('');
          const fullAddress = `${shippingDetails.houseFlat}, ${shippingDetails.streetArea}`;
          const formattedDetails = {
            fullName: shippingDetails.fullName,
            email: shippingDetails.email,
            phone: shippingDetails.phone,
            address: fullAddress,
            city: shippingDetails.city,
            state: shippingDetails.state,
            postcode: shippingDetails.postcode,
            paymentMethod: paymentDetails.method === 'cod' ? 'Cash on Delivery (COD)' : paymentDetails.method === 'upi' ? 'UPI Payment' : 'Demo Card'
          };
          
          const order = await handleCheckout(formattedDetails);
          setCreatedOrder(order);
          setStep(3);
          setFormErrors({});
        } catch (err) {
          setErrorMessage(err.message || 'Error completing checkout. Please try again.');
        }
      }
    }
  };

  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setFormErrors({});
    }
  };

  const handleClose = () => {
    setStep(1);
    setShippingDetails({
      fullName: '',
      email: '',
      phone: '',
      houseFlat: '',
      streetArea: '',
      city: '',
      state: 'Gujarat',
      postcode: '',
    });
    setPaymentDetails({
      cardName: '',
      cardNumber: '',
      expiry: '',
      cvv: '',
      method: 'cod',
      upiId: '',
    });
    setCreatedOrder(null);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300">
      
      <div 
        className="absolute inset-0 cursor-default" 
        onClick={() => step !== 3 && handleClose()} 
      />

      {/* Checkout Card */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-light-border dark:border-dark-border shadow-2xl overflow-hidden flex flex-col z-10 max-h-[90svh] animate-in fade-in zoom-in-95 duration-200">
        
        {step !== 3 && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white border border-light-border dark:border-dark-border hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-light-border dark:border-dark-border text-left">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Secure checkout (India Delivery)
          </h2>
          {step !== 3 && (
            <div className="flex gap-4 mt-3">
              <span className={`text-xs font-bold ${step === 1 ? 'text-brand-primary' : 'text-slate-400'}`}>
                1. Shipping Address
              </span>
              <span className="text-slate-300">&rsaquo;</span>
              <span className={`text-xs font-bold ${step === 2 ? 'text-brand-primary' : 'text-slate-400'}`}>
                2. Select Payment
              </span>
            </div>
          )}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 text-left">
          
          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-500 font-bold mb-4">
              {errorMessage}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                  <input
                    type="text"
                    value={shippingDetails.fullName}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, fullName: e.target.value })}
                    className={`block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-850 focus:outline-none focus:ring-1 focus:ring-brand-primary ${
                      formErrors.fullName ? 'border-rose-500' : 'border-light-border dark:border-dark-border'
                    }`}
                    placeholder="e.g. Vikramaditya Singh"
                  />
                  {formErrors.fullName && <p className="text-[10px] text-rose-500 font-semibold">{formErrors.fullName}</p>}
                </div>
                
                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={shippingDetails.email}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, email: e.target.value })}
                    className={`block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-850 focus:outline-none focus:ring-1 focus:ring-brand-primary ${
                      formErrors.email ? 'border-rose-500' : 'border-light-border dark:border-dark-border'
                    }`}
                    placeholder="name@domain.com"
                  />
                  {formErrors.email && <p className="text-[10px] text-rose-500 font-semibold">{formErrors.email}</p>}
                </div>

                {/* Mobile Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mobile Number (India)</label>
                  <input
                    type="text"
                    value={shippingDetails.phone}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                    className={`block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-850 focus:outline-none focus:ring-1 focus:ring-brand-primary ${
                      formErrors.phone ? 'border-rose-500' : 'border-light-border dark:border-dark-border'
                    }`}
                    placeholder="e.g. +91 98765 43210"
                  />
                  {formErrors.phone && <p className="text-[10px] text-rose-500 font-semibold">{formErrors.phone}</p>}
                </div>

                {/* PIN Code */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">PIN Code (6 digits)</label>
                  <input
                    type="text"
                    maxLength="6"
                    value={shippingDetails.postcode}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, postcode: e.target.value })}
                    className={`block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-850 focus:outline-none focus:ring-1 focus:ring-brand-primary ${
                      formErrors.postcode ? 'border-rose-500' : 'border-light-border dark:border-dark-border'
                    }`}
                    placeholder="e.g. 395002"
                  />
                  {formErrors.postcode && <p className="text-[10px] text-rose-500 font-semibold">{formErrors.postcode}</p>}
                </div>
              </div>

              {/* House/Flat/Building */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">House / Flat / Building / Apartment Details</label>
                <input
                  type="text"
                  value={shippingDetails.houseFlat}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, houseFlat: e.target.value })}
                  className={`block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-850 focus:outline-none focus:ring-1 focus:ring-brand-primary ${
                    formErrors.houseFlat ? 'border-rose-500' : 'border-light-border dark:border-dark-border'
                  }`}
                  placeholder="e.g. Flat 302, Shanti Heights"
                />
                {formErrors.houseFlat && <p className="text-[10px] text-rose-500 font-semibold">{formErrors.houseFlat}</p>}
              </div>

              {/* Street/Area */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Street / Area / Colony Name</label>
                <input
                  type="text"
                  value={shippingDetails.streetArea}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, streetArea: e.target.value })}
                  className={`block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-855 focus:outline-none focus:ring-1 focus:ring-brand-primary ${
                    formErrors.streetArea ? 'border-rose-500' : 'border-light-border dark:border-dark-border'
                  }`}
                  placeholder="e.g. Ring Road, Surat"
                />
                {formErrors.streetArea && <p className="text-[10px] text-rose-500 font-semibold">{formErrors.streetArea}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* City */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">City</label>
                  <input
                    type="text"
                    value={shippingDetails.city}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                    className={`block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-850 focus:outline-none focus:ring-1 focus:ring-brand-primary ${
                      formErrors.city ? 'border-rose-500' : 'border-light-border dark:border-dark-border'
                    }`}
                    placeholder="e.g. Surat"
                  />
                  {formErrors.city && <p className="text-[10px] text-rose-500 font-semibold">{formErrors.city}</p>}
                </div>

                {/* State Dropdown */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">State</label>
                  <select
                    value={shippingDetails.state}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, state: e.target.value })}
                    className="block w-full rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-slate-850 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  >
                    {indianStates.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* Country */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Country</label>
                  <input
                    type="text"
                    readOnly
                    value="India"
                    className="block w-full rounded-lg border border-light-border dark:border-dark-border bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              
              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentDetails({ ...paymentDetails, method: 'cod' })}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all text-xs ${
                      paymentDetails.method === 'cod'
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                        : 'border-light-border dark:border-dark-border bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Landmark className="h-4 w-4" />
                    <span>Cash on Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentDetails({ ...paymentDetails, method: 'upi' })}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all text-xs ${
                      paymentDetails.method === 'upi'
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                        : 'border-light-border dark:border-dark-border bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>UPI Payment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentDetails({ ...paymentDetails, method: 'card' })}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition-all text-xs ${
                      paymentDetails.method === 'card'
                        ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                        : 'border-light-border dark:border-dark-border bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Demo Card</span>
                  </button>
                </div>
              </div>

              {/* Form details based on selection */}
              {paymentDetails.method === 'card' ? (
                <div className="space-y-4 border-t border-light-border dark:border-dark-border pt-4">
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Cardholder Name</label>
                    <input
                      type="text"
                      value={paymentDetails.cardName}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, cardName: e.target.value })}
                      className={`block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-850 focus:outline-none focus:ring-1 focus:ring-brand-primary ${
                        formErrors.cardName ? 'border-rose-500' : 'border-light-border dark:border-dark-border'
                      }`}
                      placeholder="e.g. Vikramaditya Singh"
                    />
                    {formErrors.cardName && <p className="text-[10px] text-rose-500 font-semibold">{formErrors.cardName}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Card Number</label>
                    <input
                      type="text"
                      value={paymentDetails.cardNumber}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                      className={`block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-850 focus:outline-none focus:ring-1 focus:ring-brand-primary ${
                        formErrors.cardNumber ? 'border-rose-500' : 'border-light-border dark:border-dark-border'
                      }`}
                      placeholder="4000 1234 5678 9010"
                    />
                    {formErrors.cardNumber && <p className="text-[10px] text-rose-500 font-semibold">{formErrors.cardNumber}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={paymentDetails.expiry}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, expiry: e.target.value })}
                        className={`block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-855 focus:outline-none focus:ring-1 focus:ring-brand-primary ${
                          formErrors.expiry ? 'border-rose-500' : 'border-light-border dark:border-dark-border'
                        }`}
                        placeholder="MM/YY"
                      />
                      {formErrors.expiry && <p className="text-[10px] text-rose-500 font-semibold">{formErrors.expiry}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">CVV</label>
                      <input
                        type="password"
                        maxLength="3"
                        value={paymentDetails.cvv}
                        onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                        className={`block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-850 focus:outline-none focus:ring-1 focus:ring-brand-primary ${
                          formErrors.cvv ? 'border-rose-500' : 'border-light-border dark:border-dark-border'
                        }`}
                        placeholder="123"
                      />
                      {formErrors.cvv && <p className="text-[10px] text-rose-500 font-semibold">{formErrors.cvv}</p>}
                    </div>
                  </div>

                </div>
              ) : paymentDetails.method === 'upi' ? (
                <div className="space-y-4 border-t border-light-border dark:border-dark-border pt-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Enter VPA / UPI ID</label>
                    <input
                      type="text"
                      value={paymentDetails.upiId}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, upiId: e.target.value })}
                      className={`block w-full rounded-lg border px-3 py-2 text-sm text-slate-900 dark:text-white dark:bg-slate-850 focus:outline-none focus:ring-1 focus:ring-brand-primary ${
                        formErrors.upiId ? 'border-rose-500' : 'border-light-border dark:border-dark-border'
                      }`}
                      placeholder="e.g. name@upi or cell@okhdfcbank"
                    />
                    {formErrors.upiId && <p className="text-[10px] text-rose-500 font-semibold">{formErrors.upiId}</p>}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    You will receive a collect request on your UPI app (Google Pay, PhonePe, Paytm, etc.) to complete this demo purchase.
                  </p>
                </div>
              ) : (
                <div className="border border-brand-primary/20 bg-brand-primary/5 rounded-2xl p-5 space-y-2">
                  <h3 className="text-sm font-bold text-brand-primary">Cash on Delivery (COD)</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Pay in cash when our delivery executive arrives at your doorstep. Standard shipping applies. Free shipping on orders above ₹999.
                  </p>
                </div>
              )}

              {/* Secure badge */}
              <div className="flex items-center justify-center gap-2 border border-dashed border-light-border dark:border-dark-border rounded-xl p-3 text-slate-500 text-xs">
                <Shield className="h-4 w-4 text-brand-primary" />
                <span>SSL Encrypted Gateways &middot; StyleAura India Secure checkout</span>
              </div>

            </div>
          )}

          {step === 3 && createdOrder && (
            <div className="text-center py-6 space-y-6">
              
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-300">
                <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Order Confirmed!</h3>
                <p className="text-xs text-slate-500">
                  Thank you for shopping with StyleAura India. Your order is logged in our Surat hub database.
                </p>
              </div>

              {/* Order Metadata Box */}
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-light-border dark:border-dark-border rounded-2xl p-5 text-left text-xs space-y-3">
                <div className="flex justify-between border-b border-light-border dark:border-dark-border pb-2">
                  <span className="text-slate-500">Order Reference</span>
                  <span className="font-extrabold text-brand-primary tracking-wider">{createdOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer Name</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{createdOrder.shippingDetails.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mobile Number</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{createdOrder.shippingDetails.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shipping Address</span>
                  <span className="font-semibold text-slate-900 dark:text-white text-right">
                    {createdOrder.shippingDetails.address}, {createdOrder.shippingDetails.city}, {createdOrder.shippingDetails.state} - {createdOrder.shippingDetails.postcode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Delivery</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Standard Delivery (3-7 Business Days)</span>
                </div>
                <div className="flex justify-between border-t border-light-border dark:border-dark-border pt-2 font-extrabold text-sm text-slate-900 dark:text-white">
                  <span>Amount to pay</span>
                  <span>₹{createdOrder.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full flex items-center justify-center gap-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3 text-sm font-semibold hover:bg-slate-800"
              >
                Return to Shop Catalog <ArrowRight className="h-4 w-4" />
              </button>

            </div>
          )}

        </div>

        {/* Modal Footer / Actions */}
        {step !== 3 && (
          <div className="px-6 py-4 border-t border-light-border dark:border-dark-border bg-slate-50 dark:bg-slate-950/20 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-500 font-semibold block">Total to charge:</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">₹{finalTotal.toLocaleString('en-IN')}</span>
            </div>
            
            <div className="flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="px-4 py-2 border border-light-border dark:border-dark-border rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-1 bg-white dark:bg-slate-800 dark:text-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
              )}
              
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 rounded-full bg-brand-primary hover:bg-brand-primary-hover text-xs font-bold text-white flex items-center gap-1.5 transition-all shadow-md shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                {step === 1 ? (
                  <>
                    Continue to Payment <ArrowRight className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    Authorize Order <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CheckoutModal;
