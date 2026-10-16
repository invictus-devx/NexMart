/**
 * NexMart - Unified LocalStorage Store & State Management
 * Handles Products, Cart, Wishlist, Authentication, Orders & Coupons
 */

const Store = (function() {
  // Storage Keys
  const KEYS = {
    USER: 'nexmart_current_user',
    USERS_DB: 'nexmart_users_database',
    CART: 'nexmart_cart_items',
    COUPON: 'nexmart_applied_coupon',
    WISHLIST: 'nexmart_wishlist_items',
    ORDERS: 'nexmart_order_history',
    ADDRESSES: 'nexmart_saved_addresses'
  };

  // Seed default demo accounts if not already present
  function initDefaults() {
    if (!localStorage.getItem(KEYS.USERS_DB)) {
      const defaultUsers = [
        {
          id: 'usr_001',
          name: 'Aryan Sharma',
          email: 'student@college.edu',
          password: 'student123',
          phone: '+91 98765 43210',
          role: 'Student Member',
          addresses: [
            {
              id: 'addr_01',
              fullName: 'Aryan Sharma',
              phone: '+91 98765 43210',
              addressLine: 'Boys Hostel 4, Room 302, University Campus',
              city: 'New Delhi',
              state: 'Delhi',
              pincode: '110025',
              type: 'Campus'
            }
          ]
        },
        {
          id: 'usr_002',
          name: 'Priya Patel',
          email: 'pro@nexmart.com',
          password: 'pro123',
          phone: '+91 98111 22334',
          role: 'Pro Member',
          addresses: [
            {
              id: 'addr_02',
              fullName: 'Priya Patel',
              phone: '+91 98111 22334',
              addressLine: 'Apartment 5B, Skyline Towers, Sector 62',
              city: 'Noida',
              state: 'Uttar Pradesh',
              pincode: '201309',
              type: 'Home'
            }
          ]
        }
      ];
      localStorage.setItem(KEYS.USERS_DB, JSON.stringify(defaultUsers));
    }

    // Default active user is Aryan Sharma for seamless demo testing
    if (!localStorage.getItem(KEYS.USER)) {
      const users = JSON.parse(localStorage.getItem(KEYS.USERS_DB));
      localStorage.setItem(KEYS.USER, JSON.stringify(users[0]));
    }

    // Seed sample initial cart if completely empty for immediate wow-factor
    if (!localStorage.getItem(KEYS.CART)) {
      const sampleCart = [
        { productId: 1, quantity: 1 }, // iPhone 15 Pro Max
        { productId: 25, quantity: 1 } // Sony WH-1000XM5
      ];
      localStorage.setItem(KEYS.CART, JSON.stringify(sampleCart));
    }

    // Seed default coupon
    if (!localStorage.getItem(KEYS.COUPON)) {
      localStorage.setItem(KEYS.COUPON, JSON.stringify("COLLEGE20"));
    }

    // Seed default active order for immediate tracking demo
    if (!localStorage.getItem(KEYS.ORDERS)) {
      const sampleOrders = [
        {
          orderId: 'NEX-842918',
          trackingNumber: 'TRK492817263',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          status: 'Shipped',
          carrier: 'NexMart Express Air Logistics',
          estimatedDelivery: 'Tomorrow, by 8:00 PM',
          shippingAddress: {
            name: 'Aryan Sharma',
            phone: '+91 98765 43210',
            address: 'Boys Hostel 4, Room 302, University Campus',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110025'
          },
          shippingMethod: 'Priority Next-Day Air Flight',
          paymentMethod: 'card',
          items: [
            {
              id: 1,
              name: 'Apple iPhone 15 Pro Max',
              brand: 'Apple',
              price: 134900,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80'
            },
            {
              id: 25,
              name: 'Sony WH-1000XM5 Wireless Headphones',
              brand: 'Sony',
              price: 29990,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80'
            }
          ],
          totals: {
            subtotal: 189890,
            savings: 25000,
            itemsPrice: 164890,
            shipping: 0,
            discount: 5000,
            finalTotal: 159890
          }
        }
      ];
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(sampleOrders));
    }
  }

  // Run initial setup
  initDefaults();

  // ================= Currency & Formatting Helpers =================
  function formatINR(amount) {
    if (isNaN(amount)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  // ================= User Authentication =================
  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.USER)) || null;
    } catch (e) {
      return null;
    }
  }

  function login(email, password) {
    const users = JSON.parse(localStorage.getItem(KEYS.USERS_DB)) || [];
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      localStorage.setItem(KEYS.USER, JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: user }));
      return { success: true, user };
    }
    return { success: false, message: 'Invalid email or password' };
  }

  function register(userData) {
    const users = JSON.parse(localStorage.getItem(KEYS.USERS_DB)) || [];
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      return { success: false, message: 'An account with this email already exists' };
    }
    const newUser = {
      id: 'usr_' + Date.now().toString(36),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone || '+91 99999 00000',
      role: 'Valued Customer',
      addresses: userData.address ? [
        {
          id: 'addr_' + Date.now(),
          fullName: userData.name,
          phone: userData.phone,
          addressLine: userData.address,
          city: userData.city || 'Mumbai',
          state: userData.state || 'Maharashtra',
          pincode: userData.pincode || '400001',
          type: 'Home'
        }
      ] : []
    };
    users.push(newUser);
    localStorage.setItem(KEYS.USERS_DB, JSON.stringify(users));
    localStorage.setItem(KEYS.USER, JSON.stringify(newUser));
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: newUser }));
    return { success: true, user: newUser };
  }

  function logout() {
    localStorage.removeItem(KEYS.USER);
    window.dispatchEvent(new CustomEvent('auth-changed', { detail: null }));
  }

  // ================= Cart Management =================
  function getRawCart() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.CART)) || [];
    } catch (e) {
      return [];
    }
  }

  function getCart() {
    const raw = getRawCart();
    return raw.map(item => {
      const product = PRODUCTS_DB.find(p => p.id === item.productId);
      return product ? { ...product, quantity: item.quantity } : null;
    }).filter(Boolean);
  }

  function getCartCount() {
    const raw = getRawCart();
    return raw.reduce((sum, item) => sum + item.quantity, 0);
  }

  function addToCart(productId, quantity = 1) {
    const raw = getRawCart();
    const existingIndex = raw.findIndex(item => item.productId === productId);
    const product = PRODUCTS_DB.find(p => p.id === productId);

    if (!product) return { success: false, message: 'Product not found' };

    if (existingIndex > -1) {
      raw[existingIndex].quantity += quantity;
      if (raw[existingIndex].quantity > product.stock) {
        raw[existingIndex].quantity = product.stock;
      }
    } else {
      raw.push({ productId, quantity: Math.min(quantity, product.stock) });
    }

    localStorage.setItem(KEYS.CART, JSON.stringify(raw));
    window.dispatchEvent(new CustomEvent('cart-updated'));
    return { success: true, count: getCartCount(), product };
  }

  function updateQuantity(productId, quantity) {
    let raw = getRawCart();
    const product = PRODUCTS_DB.find(p => p.id === productId);
    if (quantity <= 0) {
      raw = raw.filter(item => item.productId !== productId);
    } else {
      const item = raw.find(i => i.productId === productId);
      if (item) {
        item.quantity = Math.min(quantity, product ? product.stock : 99);
      }
    }
    localStorage.setItem(KEYS.CART, JSON.stringify(raw));
    window.dispatchEvent(new CustomEvent('cart-updated'));
  }

  function removeFromCart(productId) {
    let raw = getRawCart();
    raw = raw.filter(item => item.productId !== productId);
    localStorage.setItem(KEYS.CART, JSON.stringify(raw));
    window.dispatchEvent(new CustomEvent('cart-updated'));
  }

  function clearCart() {
    localStorage.setItem(KEYS.CART, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent('cart-updated'));
  }

  // ================= Coupon & Calculations =================
  function getAppliedCouponCode() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.COUPON)) || null;
    } catch (e) {
      return null;
    }
  }

  function applyCoupon(code) {
    const clean = code.trim().toUpperCase();
    if (!COUPONS[clean]) {
      return { success: false, message: 'Invalid or expired coupon code' };
    }
    const coupon = COUPONS[clean];
    const totals = getCartTotals(false);
    if (totals.itemsPrice < coupon.minCart) {
      return { 
        success: false, 
        message: `Cart total must be at least ${formatINR(coupon.minCart)} to use coupon ${clean}` 
      };
    }
    localStorage.setItem(KEYS.COUPON, JSON.stringify(clean));
    window.dispatchEvent(new CustomEvent('cart-updated'));
    return { success: true, message: `Coupon ${clean} applied successfully!`, coupon };
  }

  function removeCoupon() {
    localStorage.removeItem(KEYS.COUPON);
    window.dispatchEvent(new CustomEvent('cart-updated'));
  }

  function getCartTotals(includeCoupon = true) {
    const items = getCart();
    let subtotal = 0; // sum of original price
    let itemsPrice = 0; // sum of discounted actual price

    items.forEach(item => {
      subtotal += (item.originalPrice || item.price) * item.quantity;
      itemsPrice += item.price * item.quantity;
    });

    const savings = subtotal - itemsPrice;
    
    // Free Shipping Threshold: ₹1,000
    const shipping = itemsPrice >= 1000 || itemsPrice === 0 ? 0 : 99;
    
    // Tax is included in MRP (standard in India)
    const tax = Math.round(itemsPrice * 0.18 / 1.18); 

    let discount = 0;
    const couponCode = includeCoupon ? getAppliedCouponCode() : null;
    let couponDetails = null;

    if (couponCode && COUPONS[couponCode]) {
      const c = COUPONS[couponCode];
      couponDetails = { code: couponCode, ...c };
      if (itemsPrice >= c.minCart) {
        if (c.type === 'percent') {
          discount = Math.min((itemsPrice * c.discount) / 100, c.maxDiscount || Infinity);
        } else if (c.type === 'flat') {
          discount = Math.min(c.discount, itemsPrice);
        }
      }
    }

    const finalTotal = Math.max(0, itemsPrice - discount + shipping);

    return {
      subtotal,
      savings,
      itemsPrice,
      shipping,
      freeShippingThreshold: 1000,
      amountNeededForFreeShipping: Math.max(0, 1000 - itemsPrice),
      tax,
      discount,
      couponDetails,
      finalTotal,
      itemCount: items.reduce((acc, i) => acc + i.quantity, 0)
    };
  }

  // ================= Wishlist Management =================
  function getWishlist() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEYS.WISHLIST)) || [];
      return raw.map(id => PRODUCTS_DB.find(p => p.id === id)).filter(Boolean);
    } catch (e) {
      return [];
    }
  }

  function isInWishlist(productId) {
    const raw = JSON.parse(localStorage.getItem(KEYS.WISHLIST)) || [];
    return raw.includes(productId);
  }

  function toggleWishlist(productId) {
    let raw = JSON.parse(localStorage.getItem(KEYS.WISHLIST)) || [];
    const index = raw.indexOf(productId);
    let added = false;
    if (index > -1) {
      raw.splice(index, 1);
    } else {
      raw.push(productId);
      added = true;
    }
    localStorage.setItem(KEYS.WISHLIST, JSON.stringify(raw));
    window.dispatchEvent(new CustomEvent('wishlist-updated'));
    return { added, count: raw.length };
  }

  // ================= Order Management =================
  function getAllOrders() {
    try {
      return JSON.parse(localStorage.getItem(KEYS.ORDERS)) || [];
    } catch (e) {
      return [];
    }
  }

  function getOrderById(orderId) {
    const orders = getAllOrders();
    return orders.find(o => o.orderId === orderId);
  }

  function createOrder(orderPayload) {
    const orders = getAllOrders();
    const newOrder = {
      orderId: 'NEX-' + Math.floor(100000 + Math.random() * 900000),
      trackingNumber: 'TRK' + Math.floor(100000000 + Math.random() * 900000000),
      createdAt: new Date().toISOString(),
      status: 'Confirmed', // Confirmed, Packed, Shipped, Out for Delivery, Delivered
      customer: orderPayload.customer,
      shippingAddress: orderPayload.shippingAddress,
      deliveryMethod: orderPayload.deliveryMethod || 'Standard Express',
      paymentMethod: orderPayload.paymentMethod,
      paymentStatus: 'Paid',
      items: orderPayload.items || getCart(),
      totals: orderPayload.totals || getCartTotals(),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    };

    orders.unshift(newOrder);
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));

    // Clear cart after placing order
    clearCart();

    return newOrder;
  }

  // ================= Toast System =================
  function showToast(title, description, type = 'info', duration = 3500) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'bi-info-circle-fill';
    if (type === 'success') iconClass = 'bi-check-circle-fill';
    if (type === 'error') iconClass = 'bi-exclamation-triangle-fill';

    toast.innerHTML = `
      <i class="bi ${iconClass} toast-icon"></i>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        ${description ? `<div class="toast-desc">${description}</div>` : ''}
      </div>
      <button class="btn-toast-close" style="color:var(--text-muted);font-size:1.1rem;">
        <i class="bi bi-x"></i>
      </button>
    `;

    toast.querySelector('.btn-toast-close').addEventListener('click', () => toast.remove());

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Public API
  return {
    formatINR,
    getCurrentUser,
    login,
    register,
    logout,
    getCart,
    getCartCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    getAppliedCouponCode,
    getCartTotals,
    getWishlist,
    isInWishlist,
    toggleWishlist,
    getAllOrders,
    getOrderById,
    createOrder,
    showToast
  };
})();
