/**
 * NexMart - Main Application Logic & UI Interactions
 * Full E-Commerce Pipeline from Catalog Search to 4-Step Checkout & Invoice
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    selectedCategory: 'all',
    searchQuery: '',
    selectedBrands: [],
    maxPrice: 450000,
    minRating: 0,
    sortBy: 'featured',
    viewMode: 'grid', // 'grid' | 'list'
    activeCheckoutStep: 1,
    checkoutData: {
      address: null,
      shippingMethod: 'standard',
      shippingCost: 0,
      paymentMethod: 'card'
    }
  };

  // DOM Elements
  const DOM = {
    // Header
    header: document.querySelector('.site-header'),
    searchInput: document.getElementById('global-search-input'),
    searchBtn: document.querySelector('.search-btn'),
    searchDropdown: document.getElementById('search-dropdown'),
    cartBadge: document.getElementById('header-cart-badge'),
    wishlistBadge: document.getElementById('header-wishlist-badge'),
    userBtn: document.getElementById('header-user-btn'),
    userNameDisplay: document.getElementById('header-user-name'),
    cartBtn: document.getElementById('header-cart-btn'),
    wishlistBtn: document.getElementById('header-wishlist-btn'),

    // Category Nav
    categoryNavList: document.getElementById('category-nav-list'),

    // Catalog & Filters
    productGrid: document.getElementById('products-grid'),
    productCountDisplay: document.getElementById('products-count'),
    categoryFilterList: document.getElementById('sidebar-category-list'),
    brandFilterList: document.getElementById('sidebar-brand-list'),
    priceSlider: document.getElementById('price-range-slider'),
    priceDisplay: document.getElementById('max-price-display'),
    ratingFilterList: document.getElementById('sidebar-rating-list'),
    sortSelect: document.getElementById('sort-products-select'),
    btnGridView: document.getElementById('btn-view-grid'),
    btnListView: document.getElementById('btn-view-list'),
    btnResetFilters: document.getElementById('btn-reset-filters'),

    // Flash timer
    flashHours: document.getElementById('flash-hrs'),
    flashMins: document.getElementById('flash-mins'),
    flashSecs: document.getElementById('flash-secs'),

    // Cart Drawer
    cartDrawer: document.getElementById('cart-drawer'),
    drawerBackdrop: document.getElementById('drawer-backdrop'),
    btnCloseCart: document.getElementById('btn-close-cart'),
    cartItemsList: document.getElementById('cart-items-container'),
    cartSubtotal: document.getElementById('cart-subtotal'),
    cartSavings: document.getElementById('cart-savings'),
    cartShipping: document.getElementById('cart-shipping'),
    cartDiscountRow: document.getElementById('cart-discount-row'),
    cartDiscount: document.getElementById('cart-discount'),
    cartTotal: document.getElementById('cart-total'),
    cartProgressBar: document.getElementById('shipping-progress-bar'),
    cartProgressText: document.getElementById('shipping-progress-text'),
    couponInput: document.getElementById('coupon-code-input'),
    btnApplyCoupon: document.getElementById('btn-apply-coupon'),
    appliedCouponBox: document.getElementById('applied-coupon-box'),
    btnStartCheckout: document.getElementById('btn-start-checkout'),

    // Quick View Modal
    quickViewModal: document.getElementById('quick-view-modal'),
    quickViewContent: document.getElementById('quick-view-content'),

    // Checkout Modal
    checkoutModal: document.getElementById('checkout-modal'),
    checkoutSteps: document.querySelectorAll('.step-node'),
    checkoutPanels: document.querySelectorAll('.checkout-step-panel'),
    btnProceedStep: document.getElementById('btn-proceed-step'),
    btnBackStep: document.getElementById('btn-back-step'),

    // Auth Modal
    authModal: document.getElementById('auth-modal'),
    loginTab: document.getElementById('tab-login'),
    registerTab: document.getElementById('tab-register'),
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),

    // Orders Modal
    ordersModal: document.getElementById('orders-modal'),
    ordersListContainer: document.getElementById('orders-list-container')
  };

  // ================= Initialize App =================
  function init() {
    setupCategoriesNav();
    setupBrandFilters();
    renderProducts();
    updateHeaderBadges();
    updateUserInterface();
    startFlashSaleTimer();
    bindEventListeners();
  }

  // ================= Header & User State =================
  function updateUserInterface() {
    const user = Store.getCurrentUser();
    if (user) {
      DOM.userNameDisplay.textContent = user.name.split(' ')[0];
      DOM.userBtn.title = `Logged in as ${user.name} (${user.email})`;
    } else {
      DOM.userNameDisplay.textContent = 'Sign In';
      DOM.userBtn.title = 'Click to login or create account';
    }
  }

  function updateHeaderBadges() {
    const cartCount = Store.getCartCount();
    DOM.cartBadge.textContent = cartCount;
    DOM.cartBadge.style.display = cartCount > 0 ? 'flex' : 'none';

    const wishlistCount = Store.getWishlist().length;
    DOM.wishlistBadge.textContent = wishlistCount;
    DOM.wishlistBadge.style.display = wishlistCount > 0 ? 'flex' : 'none';

    // Sync mobile bottom navigation badges
    const mobCartBadge = document.getElementById('mob-cart-badge');
    if (mobCartBadge) {
      mobCartBadge.textContent = cartCount;
      mobCartBadge.style.display = cartCount > 0 ? 'flex' : 'none';
    }

    const mobWishlistBadge = document.getElementById('mob-wishlist-badge');
    if (mobWishlistBadge) {
      mobWishlistBadge.textContent = wishlistCount;
      mobWishlistBadge.style.display = wishlistCount > 0 ? 'flex' : 'none';
    }
  }

  // ================= Categories Bar & Filter =================
  function setupCategoriesNav() {
    // Top Bar Pill list
    DOM.categoryNavList.innerHTML = CATEGORIES.map(cat => `
      <li>
        <button class="cat-pill ${state.selectedCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">
          <i class="bi ${cat.icon}"></i>
          <span>${cat.name}</span>
        </button>
      </li>
    `).join('');

    // Sidebar Category Filter
    DOM.categoryFilterList.innerHTML = CATEGORIES.map(cat => `
      <li>
        <button class="filter-cat-btn ${state.selectedCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">
          <span>${cat.name}</span>
          <span class="filter-badge-count">${cat.count}</span>
        </button>
      </li>
    `).join('');
  }

  function setupBrandFilters() {
    DOM.brandFilterList.innerHTML = BRANDS.map(brand => `
      <label class="filter-checkbox-label">
        <input type="checkbox" value="${brand}" class="brand-checkbox">
        <span>${brand}</span>
      </label>
    `).join('');
  }

  // ================= Catalog Filtering & Rendering =================
  function getFilteredProducts() {
    return PRODUCTS_DB.filter(product => {
      // Category filter
      if (state.selectedCategory !== 'all' && product.category !== state.selectedCategory) {
        return false;
      }

      // Search Query
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        const matchTitle = product.name.toLowerCase().includes(query);
        const matchBrand = product.brand.toLowerCase().includes(query);
        const matchDesc = product.description.toLowerCase().includes(query);
        if (!matchTitle && !matchBrand && !matchDesc) return false;
      }

      // Brand Filter
      if (state.selectedBrands.length > 0 && !state.selectedBrands.includes(product.brand)) {
        return false;
      }

      // Price Filter
      if (product.price > state.maxPrice) {
        return false;
      }

      // Rating Filter
      if (product.rating < state.minRating) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      switch (state.sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        case 'discount': return b.discount - a.discount;
        case 'name': return a.name.localeCompare(b.name);
        case 'featured':
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });
  }

  function renderProducts() {
    const products = getFilteredProducts();
    DOM.productCountDisplay.textContent = `Showing ${products.length} of ${PRODUCTS_DB.length} luxury electronics`;

    if (products.length === 0) {
      DOM.productGrid.innerHTML = `
        <div class="empty-catalog-state">
          <i class="bi bi-search"></i>
          <h3>No matching electronics found</h3>
          <p class="text-secondary" style="margin-top:0.5rem;margin-bottom:1.5rem;">
            Try relaxing your filter criteria or searching for another keyword.
          </p>
          <button class="btn-primary" id="btn-empty-reset">
            <i class="bi bi-arrow-clockwise"></i> Reset All Filters
          </button>
        </div>
      `;
      document.getElementById('btn-empty-reset')?.addEventListener('click', resetAllFilters);
      return;
    }

    DOM.productGrid.className = `product-grid ${state.viewMode === 'list' ? 'list-view' : ''}`;

    DOM.productGrid.innerHTML = products.map(product => {
      const isWishlisted = Store.isInWishlist(product.id);
      const firstSpecKey = Object.keys(product.specs)[0];
      const firstSpecVal = product.specs[firstSpecKey];

      return `
        <div class="product-card" data-id="${product.id}">
          <div class="card-media">
            <img src="${product.image}" alt="${product.name}" class="card-img" loading="lazy">
            ${product.badge ? `<span class="card-badge">${product.badge}</span>` : ''}
            ${product.discount ? `<span class="card-discount-tag">-${product.discount}%</span>` : ''}
            
            <div class="card-actions-overlay">
              <button class="card-action-btn ${isWishlisted ? 'active-wishlist' : ''}" data-action="wishlist" data-id="${product.id}" title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}">
                <i class="bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'}"></i>
              </button>
              <button class="card-action-btn" data-action="quickview" data-id="${product.id}" title="Quick View">
                <i class="bi bi-eye"></i>
              </button>
            </div>
          </div>

          <div class="card-body">
            <div class="card-meta">
              <span class="card-brand">${product.brand}</span>
              <div class="card-rating">
                <i class="bi bi-star-fill"></i>
                <span>${product.rating} (${product.reviews.toLocaleString()})</span>
              </div>
            </div>

            <h3 class="card-title" title="${product.name}">${product.name}</h3>
            
            <div class="card-spec-pill">
              <i class="bi bi-cpu text-gold"></i> ${firstSpecKey}: ${firstSpecVal}
            </div>

            <div class="card-price-row">
              <span class="current-price">${Store.formatINR(product.price)}</span>
              ${product.originalPrice ? `<span class="original-price">${Store.formatINR(product.originalPrice)}</span>` : ''}
            </div>

            <button class="btn-card-add" data-action="add-cart" data-id="${product.id}">
              <i class="bi bi-cart-plus"></i> Add to Cart
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // ================= Auto Scroll & Search Helpers =================
  function scrollToProducts(force = true) {
    const catalogEl = document.getElementById('catalog');
    if (!catalogEl) return;

    // Use small delay to ensure DOM update from renderProducts completes before scrolling
    setTimeout(() => {
      const header = document.querySelector('.site-header');
      const headerHeight = header ? header.offsetHeight : 115;
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      const elementTop = catalogEl.getBoundingClientRect().top;
      const targetScrollY = currentScrollY + elementTop - headerHeight + 5;

      // Native scrollIntoView respecting scroll-margin-top
      try {
        catalogEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (err) {}

      // Fallback window.scrollTo
      window.scrollTo({
        top: Math.max(0, targetScrollY),
        behavior: 'smooth'
      });
    }, 30);
  }

  // ================= Live Autocomplete Search =================
  function handleSearchInput(e) {
    const val = e.target.value.trim().toLowerCase();
    state.searchQuery = val;

    if (!val) {
      DOM.searchDropdown.classList.remove('active');
      renderProducts();
      return;
    }

    // Immediately render filtered products
    renderProducts();

    // Directly take user down to the products catalog view
    scrollToProducts(true);

    const matches = PRODUCTS_DB.filter(p => 
      p.name.toLowerCase().includes(val) || 
      p.brand.toLowerCase().includes(val) ||
      p.category.toLowerCase().includes(val)
    ).slice(0, 6);

    if (matches.length > 0) {
      DOM.searchDropdown.innerHTML = matches.map(p => `
        <div class="search-item" data-id="${p.id}">
          <img src="${p.image}" alt="${p.name}" class="search-item-img">
          <div class="search-item-info">
            <div class="search-item-title">${p.name}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);">${p.brand} &bull; ${p.category}</div>
          </div>
          <div class="search-item-price">${Store.formatINR(p.price)}</div>
        </div>
      `).join('');
      DOM.searchDropdown.classList.add('active');
    } else {
      DOM.searchDropdown.innerHTML = `
        <div style="padding:1.5rem;text-align:center;color:var(--text-muted);font-size:0.88rem;">
          No matching products for "${val}"
        </div>
      `;
      DOM.searchDropdown.classList.add('active');
    }
  }

  // ================= Cart Drawer Operations =================
  function openCartDrawer() {
    renderCart();
    DOM.cartDrawer.classList.add('active');
    DOM.drawerBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    DOM.cartDrawer.classList.remove('active');
    DOM.drawerBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderCart() {
    const cart = Store.getCart();
    const totals = Store.getCartTotals();

    // Free Shipping Progress
    const progressPercent = Math.min(100, Math.round((totals.itemsPrice / totals.freeShippingThreshold) * 100));
    DOM.cartProgressBar.style.width = `${progressPercent}%`;

    if (totals.itemsPrice >= totals.freeShippingThreshold && totals.itemsPrice > 0) {
      DOM.cartProgressText.innerHTML = `<span><i class="bi bi-check-circle-fill text-gold"></i> Congratulations! You unlocked <strong>FREE Express Shipping</strong></span>`;
    } else {
      DOM.cartProgressText.innerHTML = `
        <span>Add <strong>${Store.formatINR(totals.amountNeededForFreeShipping)}</strong> more for FREE Shipping</span>
        <span>${progressPercent}%</span>
      `;
    }

    // Render Items
    if (cart.length === 0) {
      DOM.cartItemsList.innerHTML = `
        <div class="cart-empty-message">
          <i class="bi bi-cart-x cart-empty-icon"></i>
          <h4>Your cart is empty</h4>
          <p class="text-secondary" style="font-size:0.88rem;margin:0.5rem 0 1.5rem;">Explore top electronics and add items to your cart</p>
          <button class="btn-primary" id="btn-start-shopping" style="margin:auto;">
            Explore Catalog
          </button>
        </div>
      `;
      document.getElementById('btn-start-shopping')?.addEventListener('click', closeCartDrawer);
    } else {
      DOM.cartItemsList.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-details">
            <h4 class="cart-item-title">${item.name}</h4>
            <div class="cart-item-price">${Store.formatINR(item.price)}</div>
            
            <div class="qty-control-group">
              <button class="qty-btn" data-action="decrease-qty" data-id="${item.id}">
                <i class="bi bi-dash"></i>
              </button>
              <span class="qty-display">${item.quantity}</span>
              <button class="qty-btn" data-action="increase-qty" data-id="${item.id}">
                <i class="bi bi-plus"></i>
              </button>
            </div>
          </div>
          <button class="btn-remove-item" data-action="remove-item" data-id="${item.id}" title="Remove item">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `).join('');
    }

    // Update Totals Breakdown
    DOM.cartSubtotal.textContent = Store.formatINR(totals.subtotal);
    DOM.cartSavings.textContent = `-${Store.formatINR(totals.savings)}`;
    DOM.cartShipping.textContent = totals.shipping === 0 ? 'FREE' : Store.formatINR(totals.shipping);

    if (totals.discount > 0) {
      DOM.cartDiscountRow.style.display = 'flex';
      DOM.cartDiscount.textContent = `-${Store.formatINR(totals.discount)}`;
    } else {
      DOM.cartDiscountRow.style.display = 'none';
    }

    DOM.cartTotal.textContent = Store.formatINR(totals.finalTotal);

    // Coupon Tag
    if (totals.couponDetails) {
      DOM.appliedCouponBox.innerHTML = `
        <div class="applied-coupon-tag">
          <span><i class="bi bi-tag-fill"></i> ${totals.couponDetails.code} Applied (${totals.couponDetails.description})</span>
          <button id="btn-remove-coupon" style="color:var(--accent-red);font-weight:bold;margin-left:8px;">
            <i class="bi bi-x-circle"></i>
          </button>
        </div>
      `;
      document.getElementById('btn-remove-coupon')?.addEventListener('click', () => {
        Store.removeCoupon();
        Store.showToast('Coupon Removed', 'Coupon code has been cleared', 'info');
      });
    } else {
      DOM.appliedCouponBox.innerHTML = '';
    }

    // Toggle checkout button state
    DOM.btnStartCheckout.disabled = cart.length === 0;
    DOM.btnStartCheckout.style.opacity = cart.length === 0 ? '0.5' : '1';
  }

  // ================= Quick View Modal =================
  function openQuickView(productId) {
    const product = PRODUCTS_DB.find(p => p.id === productId);
    if (!product) return;

    const isWishlisted = Store.isInWishlist(product.id);

    DOM.quickViewContent.innerHTML = `
      <div class="quick-view-grid">
        <div class="quick-view-gallery">
          <img src="${product.image}" alt="${product.name}" id="qv-main-image">
        </div>

        <div class="quick-view-info">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
            <span class="card-brand">${product.brand}</span>
            <div class="card-rating">
              <i class="bi bi-star-fill"></i>
              <span>${product.rating} / 5 (${product.reviews.toLocaleString()} reviews)</span>
            </div>
          </div>

          <h2 style="font-size:1.6rem;line-height:1.2;margin-bottom:1rem;">${product.name}</h2>
          
          <div style="display:flex;align-items:baseline;gap:1rem;margin-bottom:1.25rem;">
            <span style="font-size:2rem;font-weight:900;color:var(--accent-gold);">${Store.formatINR(product.price)}</span>
            ${product.originalPrice ? `<span class="original-price" style="font-size:1.1rem;">${Store.formatINR(product.originalPrice)}</span>` : ''}
            ${product.discount ? `<span class="card-discount-tag" style="position:static;">Save ${product.discount}%</span>` : ''}
          </div>

          <p style="color:var(--text-secondary);font-size:0.92rem;margin-bottom:1.25rem;line-height:1.6;">
            ${product.description}
          </p>

          <div style="margin-bottom:1.5rem;padding:0.75rem 1rem;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);border-radius:var(--radius-sm);color:var(--accent-green);font-size:0.85rem;display:flex;align-items:center;gap:0.5rem;">
            <i class="bi bi-shield-check" style="font-size:1.1rem;"></i>
            <span>In Stock (${product.stock} units remaining) &bull; 1 Year Official Manufacturer Warranty</span>
          </div>

          <h4 style="font-size:1rem;margin-bottom:0.5rem;">Key Specifications:</h4>
          <table class="specs-table">
            <tbody>
              ${Object.entries(product.specs).map(([key, val]) => `
                <tr>
                  <td>${key}</td>
                  <td>${val}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="display:flex;gap:1rem;margin-top:2rem;">
            <button class="btn-primary" id="qv-add-cart" style="flex:1;">
              <i class="bi bi-cart-plus"></i> Add to Cart
            </button>
            <button class="btn-secondary ${isWishlisted ? 'active-wishlist' : ''}" id="qv-toggle-wishlist" style="width:52px;padding:0;justify-content:center;">
              <i class="bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'}" style="${isWishlisted ? 'color:var(--accent-red);' : ''}"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('qv-add-cart').addEventListener('click', () => {
      Store.addToCart(product.id, 1);
      Store.showToast('Added to Cart', `${product.name} is now in your cart`, 'success');
      DOM.quickViewModal.classList.remove('active');
    });

    document.getElementById('qv-toggle-wishlist').addEventListener('click', (e) => {
      const res = Store.toggleWishlist(product.id);
      const icon = e.currentTarget.querySelector('i');
      if (res.added) {
        icon.className = 'bi bi-heart-fill';
        icon.style.color = 'var(--accent-red)';
        Store.showToast('Added to Wishlist', `${product.name} saved to favorites`, 'info');
      } else {
        icon.className = 'bi bi-heart';
        icon.style.color = '';
        Store.showToast('Removed from Wishlist', `${product.name} removed`, 'info');
      }
      renderProducts();
    });

    DOM.quickViewModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // ================= 4-Step Checkout Pipeline =================
  function openCheckout() {
    const cart = Store.getCart();
    if (cart.length === 0) {
      Store.showToast('Cart Empty', 'Please add items before checking out', 'error');
      return;
    }

    closeCartDrawer();
    setCheckoutStep(1);
    prefillCheckoutUserData();
    updateCheckoutSummary();
    DOM.checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function prefillCheckoutUserData() {
    const user = Store.getCurrentUser();
    if (user) {
      document.getElementById('checkout-name').value = user.name || '';
      document.getElementById('checkout-email').value = user.email || '';
      document.getElementById('checkout-phone').value = user.phone || '';
      if (user.addresses && user.addresses.length > 0) {
        const addr = user.addresses[0];
        document.getElementById('checkout-address').value = addr.addressLine || '';
        document.getElementById('checkout-city').value = addr.city || '';
        document.getElementById('checkout-state').value = addr.state || '';
        document.getElementById('checkout-pincode').value = addr.pincode || '';
      }
    }
  }

  function updateCheckoutSummary() {
    const totals = Store.getCartTotals();
    const items = Store.getCart();

    const summaryContainer = document.getElementById('checkout-order-items');
    if (summaryContainer) {
      summaryContainer.innerHTML = items.map(item => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.6rem 0;border-bottom:1px solid var(--border-subtle);font-size:0.85rem;">
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <img src="${item.image}" style="width:36px;height:36px;object-fit:cover;border-radius:4px;">
            <div>
              <div style="font-weight:600;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</div>
              <div class="text-muted">Qty: ${item.quantity}</div>
            </div>
          </div>
          <div style="font-weight:700;">${Store.formatINR(item.price * item.quantity)}</div>
        </div>
      `).join('');
    }

    const totalWithShipping = totals.finalTotal + state.checkoutData.shippingCost;
    document.getElementById('checkout-subtotal').textContent = Store.formatINR(totals.itemsPrice);
    document.getElementById('checkout-shipping').textContent = state.checkoutData.shippingCost === 0 ? 'FREE' : Store.formatINR(state.checkoutData.shippingCost);
    document.getElementById('checkout-discount').textContent = totals.discount > 0 ? `-${Store.formatINR(totals.discount)}` : '₹0';
    document.getElementById('checkout-grand-total').textContent = Store.formatINR(totalWithShipping);
  }

  function setCheckoutStep(stepNumber) {
    state.activeCheckoutStep = stepNumber;

    DOM.checkoutSteps.forEach((node, idx) => {
      const stepIdx = idx + 1;
      node.classList.remove('active', 'completed');
      if (stepIdx === stepNumber) {
        node.classList.add('active');
      } else if (stepIdx < stepNumber) {
        node.classList.add('completed');
      }
    });

    DOM.checkoutPanels.forEach((panel, idx) => {
      panel.style.display = (idx + 1 === stepNumber) ? 'block' : 'none';
    });

    DOM.btnBackStep.style.display = stepNumber > 1 && stepNumber < 4 ? 'inline-flex' : 'none';

    if (stepNumber === 1) {
      DOM.btnProceedStep.innerHTML = 'Continue to Shipping <i class="bi bi-arrow-right"></i>';
      DOM.btnProceedStep.style.display = 'inline-flex';
    } else if (stepNumber === 2) {
      DOM.btnProceedStep.innerHTML = 'Proceed to Payment <i class="bi bi-arrow-right"></i>';
      DOM.btnProceedStep.style.display = 'inline-flex';
    } else if (stepNumber === 3) {
      const totals = Store.getCartTotals();
      const finalPrice = totals.finalTotal + state.checkoutData.shippingCost;
      DOM.btnProceedStep.innerHTML = `<i class="bi bi-shield-lock"></i> Pay ${Store.formatINR(finalPrice)} Securely`;
      DOM.btnProceedStep.style.display = 'inline-flex';
    } else if (stepNumber === 4) {
      // Completed step
      DOM.btnProceedStep.style.display = 'none';
      DOM.btnBackStep.style.display = 'none';
    }
  }

  function handleCheckoutNext() {
    if (state.activeCheckoutStep === 1) {
      // Validate step 1 fields
      const name = document.getElementById('checkout-name').value.trim();
      const email = document.getElementById('checkout-email').value.trim();
      const phone = document.getElementById('checkout-phone').value.trim();
      const address = document.getElementById('checkout-address').value.trim();
      const city = document.getElementById('checkout-city').value.trim();
      const pincode = document.getElementById('checkout-pincode').value.trim();

      if (!name || !email || !phone || !address || !city || !pincode) {
        Store.showToast('Missing Details', 'Please complete all required shipping fields', 'error');
        return;
      }

      state.checkoutData.address = { name, email, phone, address, city, pincode };
      setCheckoutStep(2);
    } 
    else if (state.activeCheckoutStep === 2) {
      // Validate Shipping option
      const selectedShipping = document.querySelector('input[name="shipping_method"]:checked').value;
      if (selectedShipping === 'express') {
        state.checkoutData.shippingCost = 199;
        state.checkoutData.shippingMethod = 'Express Air Delivery (Next Day)';
      } else if (selectedShipping === 'sameday') {
        state.checkoutData.shippingCost = 499;
        state.checkoutData.shippingMethod = 'Ultra-Priority Same Day Delivery';
      } else {
        state.checkoutData.shippingCost = 0;
        state.checkoutData.shippingMethod = 'Standard Express (2-3 Business Days)';
      }

      updateCheckoutSummary();
      setCheckoutStep(3);
    } 
    else if (state.activeCheckoutStep === 3) {
      // Payment Simulation
      processPayment();
    }
  }

  function processPayment() {
    DOM.btnProceedStep.disabled = true;
    DOM.btnProceedStep.innerHTML = `<span class="spinner-border spinner-border-sm" role="status"></span> Processing Payment...`;

    setTimeout(() => {
      DOM.btnProceedStep.disabled = false;

      // Create Order in Store
      const user = Store.getCurrentUser() || { name: state.checkoutData.address.name, email: state.checkoutData.address.email };
      const order = Store.createOrder({
        customer: user,
        shippingAddress: state.checkoutData.address,
        deliveryMethod: state.checkoutData.shippingMethod,
        paymentMethod: state.checkoutData.paymentMethod
      });

      // Render Order Confirmation Step
      renderOrderSuccess(order);
      setCheckoutStep(4);
      updateHeaderBadges();
      Store.showToast('Order Placed Successfully!', `Order ID: ${order.orderId}`, 'success');
    }, 1500);
  }

  function renderOrderSuccess(order) {
    document.getElementById('success-order-id').textContent = order.orderId;
    document.getElementById('success-delivery-date').textContent = order.estimatedDelivery;
    document.getElementById('success-tracking-no').textContent = order.trackingNumber;
    document.getElementById('success-total-paid').textContent = Store.formatINR(order.totals.finalTotal);
    document.getElementById('success-address-text').textContent = `${order.shippingAddress.name}, ${order.shippingAddress.address}, ${order.shippingAddress.city} - ${order.shippingAddress.pincode}`;

    // Invoice button handler
    document.getElementById('btn-download-invoice').onclick = () => printInvoice(order);
  }

  function printInvoice(order) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>NexMart Tax Invoice - ${order.orderId}</title>
        <style>
          body { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; color: #1c1815; background: #ffffff; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #c87a12; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: 900; color: #1c1815; }
          .logo span { color: #c87a12; }
          .table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .table th { background: #f4eee3; color: #1c1815; text-align: left; padding: 12px; border-bottom: 2px solid #c87a12; font-weight: 700; }
          .table td { padding: 12px; border-bottom: 1px solid #e8ded0; color: #1c1815; }
          .totals { float: right; width: 300px; }
          .totals-row { display: flex; justify-content: space-between; padding: 6px 0; color: #574d43; }
          .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #c87a12; padding-top: 10px; color: #b36b04; }
          .badge { background: #e8f5e9; color: #059669; border: 1px solid #a7f3d0; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">Nex<span>Mart</span> Luxury Electronics</div>
            <div style="color:#574d43;font-size:14px;margin-top:3px;">Official Tax Invoice & Warranty Card</div>
            <div style="color:#8a7c6f;font-size:13px;margin-top:5px;">GSTIN: 07AAAAA0000A1Z5 | Invoice No: INV-${order.orderId}</div>
          </div>
          <div style="text-align:right;">
            <div><strong>Order ID:</strong> ${order.orderId}</div>
            <div><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</div>
            <div><strong>Status:</strong> <span class="badge">PAID</span></div>
          </div>
        </div>

        <div style="display:flex;justify-content:space-between;margin-bottom:30px;color:#574d43;">
          <div>
            <h4 style="color:#1c1815;margin-bottom:6px;">Billed & Shipped To:</h4>
            <strong style="color:#1c1815;">${order.shippingAddress.name}</strong><br>
            ${order.shippingAddress.address}<br>
            ${order.shippingAddress.city} - ${order.shippingAddress.pincode}<br>
            Phone: ${order.shippingAddress.phone}
          </div>
          <div style="text-align:right;">
            <h4 style="color:#1c1815;margin-bottom:6px;">Delivery Logistics:</h4>
            Carrier: NexMart Express Logistics<br>
            Tracking: ${order.trackingNumber}<br>
            Est. Arrival: ${order.estimatedDelivery}
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Item Description</th>
              <th>Unit Price</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(i => `
              <tr>
                <td><strong>${i.name}</strong><br><small style="color:#8a7c6f;">${i.brand}</small></td>
                <td>${Store.formatINR(i.price)}</td>
                <td>${i.quantity}</td>
                <td><strong>${Store.formatINR(i.price * i.quantity)}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div class="totals-row">
            <span>Subtotal:</span>
            <span>${Store.formatINR(order.totals.itemsPrice)}</span>
          </div>
          <div class="totals-row">
            <span>Shipping:</span>
            <span>${order.totals.shipping === 0 ? 'FREE' : Store.formatINR(order.totals.shipping)}</span>
          </div>
          ${order.totals.discount > 0 ? `
            <div class="totals-row" style="color:#059669;font-weight:600;">
              <span>Coupon Discount:</span>
              <span>-${Store.formatINR(order.totals.discount)}</span>
            </div>
          ` : ''}
          <div class="totals-row grand-total">
            <span>Total Paid:</span>
            <span>${Store.formatINR(order.totals.finalTotal)}</span>
          </div>
        </div>

        <div style="clear:both;padding-top:60px;text-align:center;color:#8a7c6f;font-size:12px;">
          Thank you for choosing NexMart. This is a computer-generated tax invoice. For returns or support, contact support@nexmart.com
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  }

  // ================= Interactive Credit Card Form Typing Simulator =================
  function setupInteractiveCreditCard() {
    const cardInput = document.getElementById('card-number-input');
    const nameInput = document.getElementById('card-name-input');
    const expiryInput = document.getElementById('card-expiry-input');

    const cardDisplay = document.getElementById('display-card-number');
    const nameDisplay = document.getElementById('display-card-name');
    const expiryDisplay = document.getElementById('display-card-expiry');

    if (cardInput && cardDisplay) {
      cardInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 16);
        val = val.replace(/(.{4})/g, '$1 ').trim();
        e.target.value = val;
        cardDisplay.textContent = val || '•••• •••• •••• ••••';
      });
    }

    if (nameInput && nameDisplay) {
      nameInput.addEventListener('input', (e) => {
        nameDisplay.textContent = e.target.value.toUpperCase() || 'YOUR NAME HERE';
      });
    }

    if (expiryInput && expiryDisplay) {
      expiryInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 2) {
          val = val.substring(0, 2) + '/' + val.substring(2);
        }
        e.target.value = val;
        expiryDisplay.textContent = val || 'MM/YY';
      });
    }
  }

  // ================= Orders History & Live Tracking Modal =================
  function renderOrderTracker(status) {
    const steps = [
      { label: 'Confirmed', icon: 'bi-check2' },
      { label: 'Packed', icon: 'bi-box-seam' },
      { label: 'Shipped', icon: 'bi-airplane' },
      { label: 'Out for Delivery', icon: 'bi-truck' },
      { label: 'Delivered', icon: 'bi-house-door' }
    ];

    const statusIndexMap = {
      'Confirmed': 0,
      'Packed': 1,
      'Shipped': 2,
      'Out for Delivery': 3,
      'Delivered': 4
    };

    const currentIndex = statusIndexMap[status] !== undefined ? statusIndexMap[status] : 2;

    return `
      <div class="order-tracker-timeline" style="margin:1.5rem 0 1rem;">
        ${steps.map((st, i) => `
          <div class="timeline-step ${i <= currentIndex ? 'active' : ''}">
            <div class="timeline-dot"><i class="bi ${st.icon}"></i></div>
            <span style="font-size:0.72rem;font-weight:${i <= currentIndex ? '700' : '500'};">${st.label}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  function openOrdersModal(filterQuery = '') {
    let orders = Store.getAllOrders();
    if (filterQuery && filterQuery.trim()) {
      const q = filterQuery.trim().toLowerCase();
      orders = orders.filter(o => 
        (o.orderId && o.orderId.toLowerCase().includes(q)) || 
        (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q)) ||
        (o.shippingAddress && o.shippingAddress.name && o.shippingAddress.name.toLowerCase().includes(q))
      );
    }

    if (orders.length === 0) {
      DOM.ordersListContainer.innerHTML = `
        <div style="text-align:center;padding:3rem 1rem;">
          <i class="bi bi-box-seam" style="font-size:3rem;color:var(--text-muted);"></i>
          <h4 style="margin:1rem 0 0.5rem;">${filterQuery ? 'No matching orders found' : 'No orders yet'}</h4>
          <p class="text-secondary" style="font-size:0.88rem;">${filterQuery ? 'Check the Order ID or Airway Bill entered.' : 'Once you checkout items, your real-time tracking details and tax invoices will appear here.'}</p>
        </div>
      `;
    } else {
      DOM.ordersListContainer.innerHTML = orders.map(order => `
        <div style="background:var(--bg-card);border:1.5px solid var(--border-subtle);border-radius:var(--radius-md);padding:1.5rem;margin-bottom:1.5rem;box-shadow:0 4px 16px rgba(80,60,40,0.06);">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border-subtle);padding-bottom:1rem;margin-bottom:1rem;flex-wrap:wrap;gap:0.5rem;">
            <div>
              <span class="order-id-badge" style="margin:0 0 0.4rem;font-size:0.95rem;">${order.orderId}</span>
              <div style="font-size:0.8rem;color:var(--text-muted);margin-top:0.25rem;">
                <i class="bi bi-calendar3"></i> Placed on ${new Date(order.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div style="text-align:right;">
              <span style="background:rgba(5,150,105,0.12);color:var(--accent-green);border:1px solid rgba(5,150,105,0.25);font-size:0.8rem;font-weight:700;padding:0.25rem 0.65rem;border-radius:var(--radius-full);">
                <i class="bi bi-circle-fill" style="font-size:0.55rem;vertical-align:middle;margin-right:4px;"></i>${order.status}
              </span>
              <div style="font-size:1.15rem;font-weight:800;color:var(--accent-gold);margin-top:0.35rem;">${Store.formatINR(order.totals.finalTotal)}</div>
            </div>
          </div>

          <!-- Real-Time Delivery Tracking Timeline -->
          ${renderOrderTracker(order.status)}

          <!-- Logistics & Airway Bill Strip -->
          <div style="background:#f8f4ec;border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:0.65rem 1rem;margin:1rem 0;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;font-size:0.82rem;">
            <div>
              <i class="bi bi-airplane-engines text-gold"></i> Carrier: <strong>${order.carrier || 'NexMart Express Air'}</strong>
            </div>
            <div>
              AWB: <strong style="font-family:monospace;color:var(--accent-gold);">${order.trackingNumber}</strong>
            </div>
            <div>
              Est. Arrival: <strong>${order.estimatedDelivery || 'Within 2-3 Days'}</strong>
            </div>
          </div>

          <!-- Items Row -->
          <div style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:center;margin-bottom:1rem;">
            ${order.items.map(item => `
              <div style="display:flex;align-items:center;gap:0.5rem;background:#ffffff;border:1px solid var(--border-subtle);border-radius:var(--radius-sm);padding:0.35rem 0.6rem;font-size:0.82rem;">
                <img src="${item.image}" alt="${item.name}" style="width:36px;height:36px;object-fit:cover;border-radius:4px;">
                <div>
                  <div style="font-weight:700;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</div>
                  <div class="text-muted" style="font-size:0.72rem;">Qty: ${item.quantity} &bull; ${Store.formatINR(item.price)}</div>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;padding-top:0.85rem;border-top:1px solid var(--border-subtle);font-size:0.85rem;flex-wrap:wrap;gap:0.5rem;">
            <span style="color:var(--text-secondary);font-size:0.82rem;">
              Ship to: <strong>${order.shippingAddress ? order.shippingAddress.name : 'Valued Customer'}</strong> (${order.shippingAddress ? order.shippingAddress.city : 'Campus'})
            </span>
            <button class="btn-primary btn-order-invoice" data-id="${order.orderId}" style="padding:0.45rem 1rem;font-size:0.82rem;">
              <i class="bi bi-file-earmark-arrow-down"></i> Tax Invoice
            </button>
          </div>
        </div>
      `).join('');

      document.querySelectorAll('.btn-order-invoice').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.id;
          const order = Store.getOrderById(id);
          if (order) printInvoice(order);
        });
      });
    }

    DOM.ordersModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }


  // ================= Wishlist Modal / Filter =================
  function filterWishlistItems() {
    const wishlist = Store.getWishlist();
    if (wishlist.length === 0) {
      Store.showToast('Wishlist Empty', 'Click the heart icon on any product to save it here', 'info');
      return;
    }
    // Filter product grid to wishlist only
    state.selectedCategory = 'all';
    DOM.categoryFilterList.querySelectorAll('.filter-cat-btn').forEach(b => b.classList.remove('active'));
    DOM.categoryNavList.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));

    const originalFiltered = getFilteredProducts;
    DOM.productCountDisplay.textContent = `Showing ${wishlist.length} saved wishlist items`;
    
    DOM.productGrid.innerHTML = wishlist.map(product => {
      const firstSpecKey = Object.keys(product.specs)[0];
      const firstSpecVal = product.specs[firstSpecKey];

      return `
        <div class="product-card" data-id="${product.id}">
          <div class="card-media">
            <img src="${product.image}" alt="${product.name}" class="card-img">
            <div class="card-actions-overlay" style="opacity:1;transform:none;">
              <button class="card-action-btn active-wishlist" data-action="wishlist" data-id="${product.id}">
                <i class="bi bi-heart-fill"></i>
              </button>
            </div>
          </div>
          <div class="card-body">
            <span class="card-brand">${product.brand}</span>
            <h3 class="card-title">${product.name}</h3>
            <div class="card-price-row">
              <span class="current-price">${Store.formatINR(product.price)}</span>
            </div>
            <button class="btn-card-add" data-action="add-cart" data-id="${product.id}">
              <i class="bi bi-cart-plus"></i> Move to Cart
            </button>
          </div>
        </div>
      `;
    }).join('');

    window.scrollTo({ top: document.querySelector('.catalog-section').offsetTop - 80, behavior: 'smooth' });
  }

  // ================= Flash Sale Timer =================
  function startFlashSaleTimer() {
    let timeLeft = 14 * 3600 + 42 * 60 + 18; // 14 hours 42 mins
    setInterval(() => {
      timeLeft--;
      if (timeLeft < 0) timeLeft = 24 * 3600;
      const h = Math.floor(timeLeft / 3600);
      const m = Math.floor((timeLeft % 3600) / 60);
      const s = timeLeft % 60;
      if (DOM.flashHours) DOM.flashHours.textContent = String(h).padStart(2, '0');
      if (DOM.flashMins) DOM.flashMins.textContent = String(m).padStart(2, '0');
      if (DOM.flashSecs) DOM.flashSecs.textContent = String(s).padStart(2, '0');
    }, 1000);
  }

  // ================= Reset Filters =================
  function resetAllFilters() {
    state.selectedCategory = 'all';
    state.searchQuery = '';
    state.selectedBrands = [];
    state.maxPrice = 450000;
    state.minRating = 0;
    state.sortBy = 'featured';

    DOM.searchInput.value = '';
    DOM.priceSlider.value = 450000;
    DOM.priceDisplay.textContent = Store.formatINR(450000);
    DOM.sortSelect.value = 'featured';

    document.querySelectorAll('.brand-checkbox').forEach(cb => cb.checked = false);
    setupCategoriesNav();
    renderProducts();
    Store.showToast('Filters Cleared', 'Catalog reset to all products', 'info');
  }

  // ================= Event Listeners =================
  function bindEventListeners() {
    // Scroll header styling
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        DOM.header.classList.add('scrolled');
      } else {
        DOM.header.classList.remove('scrolled');
      }
    });

    // Search bar input
    DOM.searchInput.addEventListener('input', handleSearchInput);

    // Search bar focus
    DOM.searchInput.addEventListener('focus', () => {
      if (DOM.searchInput.value.trim().length > 0) {
        scrollToProducts(true);
      }
    });

    // Search bar Enter key navigation
    DOM.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        DOM.searchDropdown.classList.remove('active');
        scrollToProducts(true);
      }
    });

    // Search button click
    if (DOM.searchBtn) {
      DOM.searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        DOM.searchDropdown.classList.remove('active');
        scrollToProducts(true);
      });
    }

    // Click outside search dropdown
    document.addEventListener('click', (e) => {
      if (!DOM.searchInput.contains(e.target) && !DOM.searchDropdown.contains(e.target) && (!DOM.searchBtn || !DOM.searchBtn.contains(e.target))) {
        DOM.searchDropdown.classList.remove('active');
      }
    });

    // Search suggestion item click
    DOM.searchDropdown.addEventListener('click', (e) => {
      const item = e.target.closest('.search-item');
      if (item) {
        const id = parseInt(item.dataset.id, 10);
        const prod = PRODUCTS_DB.find(p => p.id === id);
        if (prod) {
          DOM.searchInput.value = prod.name;
          state.searchQuery = prod.name.toLowerCase();
          renderProducts();
        }
        DOM.searchDropdown.classList.remove('active');
        scrollToProducts(true);
      }
    });

    // Top Category Bar clicks
    DOM.categoryNavList.addEventListener('click', (e) => {
      const btn = e.target.closest('.cat-pill');
      if (btn) {
        state.selectedCategory = btn.dataset.category;
        DOM.categoryNavList.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Sync with sidebar
        DOM.categoryFilterList.querySelectorAll('.filter-cat-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.category === state.selectedCategory);
        });

        renderProducts();
        scrollToProducts(true);
      }
    });

    // Sidebar Category clicks
    DOM.categoryFilterList.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-cat-btn');
      if (btn) {
        state.selectedCategory = btn.dataset.category;
        DOM.categoryFilterList.querySelectorAll('.filter-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Sync with top bar
        DOM.categoryNavList.querySelectorAll('.cat-pill').forEach(b => {
          b.classList.toggle('active', b.dataset.category === state.selectedCategory);
        });

        renderProducts();
        scrollToProducts(true);
      }
    });

    // Brand Checkboxes
    DOM.brandFilterList.addEventListener('change', () => {
      const checked = Array.from(document.querySelectorAll('.brand-checkbox:checked')).map(cb => cb.value);
      state.selectedBrands = checked;
      renderProducts();
    });

    // Price Slider
    DOM.priceSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.maxPrice = val;
      DOM.priceDisplay.textContent = Store.formatINR(val);
      renderProducts();
    });

    // Rating Filter
    DOM.ratingFilterList.addEventListener('click', (e) => {
      const btn = e.target.closest('.rating-filter-btn');
      if (btn) {
        DOM.ratingFilterList.querySelectorAll('.rating-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.minRating = parseFloat(btn.dataset.rating) || 0;
        renderProducts();
      }
    });

    // Sort Select
    DOM.sortSelect.addEventListener('change', (e) => {
      state.sortBy = e.target.value;
      renderProducts();
    });

    // Grid / List View Toggle
    DOM.btnGridView.addEventListener('click', () => {
      state.viewMode = 'grid';
      DOM.btnGridView.classList.add('active');
      DOM.btnListView.classList.remove('active');
      renderProducts();
    });

    DOM.btnListView.addEventListener('click', () => {
      state.viewMode = 'list';
      DOM.btnListView.classList.add('active');
      DOM.btnGridView.classList.remove('active');
      renderProducts();
    });

    // Reset Filters Button
    DOM.btnResetFilters.addEventListener('click', () => {
      resetAllFilters();
      closeMobileFilter();
    });

    // Mobile Filter Drawer Toggle & Backdrop
    const btnMobileFilter = document.getElementById('btn-mobile-filter');
    const filterSidebar = document.getElementById('filter-sidebar');
    const filterBackdrop = document.getElementById('filter-backdrop');
    const btnCloseFilterMobile = document.getElementById('btn-close-filter-mobile');

    function openMobileFilter() {
      if (filterSidebar) filterSidebar.classList.add('mobile-open');
      if (filterBackdrop) filterBackdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeMobileFilter() {
      if (filterSidebar) filterSidebar.classList.remove('mobile-open');
      if (filterBackdrop) filterBackdrop.classList.remove('active');
      document.body.style.overflow = '';
    }

    if (btnMobileFilter) btnMobileFilter.addEventListener('click', openMobileFilter);
    if (btnCloseFilterMobile) btnCloseFilterMobile.addEventListener('click', closeMobileFilter);
    if (filterBackdrop) filterBackdrop.addEventListener('click', closeMobileFilter);

    // Mobile Bottom Navigation Bar Events
    const mobNavHome = document.getElementById('mob-nav-home');
    const mobNavFilter = document.getElementById('mob-nav-filter');
    const mobNavWishlist = document.getElementById('mob-nav-wishlist');
    const mobNavCart = document.getElementById('mob-nav-cart');
    const mobNavAccount = document.getElementById('mob-nav-account');

    if (mobNavHome) {
      mobNavHome.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    if (mobNavFilter) {
      mobNavFilter.addEventListener('click', (e) => {
        e.preventDefault();
        openMobileFilter();
      });
    }

    if (mobNavWishlist) {
      mobNavWishlist.addEventListener('click', (e) => {
        e.preventDefault();
        DOM.wishlistBtn.click();
      });
    }

    if (mobNavCart) {
      mobNavCart.addEventListener('click', (e) => {
        e.preventDefault();
        openCartDrawer();
      });
    }

    if (mobNavAccount) {
      mobNavAccount.addEventListener('click', (e) => {
        e.preventDefault();
        DOM.userBtn.click();
      });
    }

    // Product Card Delegation
    DOM.productGrid.addEventListener('click', (e) => {
      const actionBtn = e.target.closest('button[data-action]');
      if (actionBtn) {
        const action = actionBtn.dataset.action;
        const id = parseInt(actionBtn.dataset.id, 10);

        if (action === 'add-cart') {
          const res = Store.addToCart(id, 1);
          if (res.success) {
            Store.showToast('Added to Cart', `${res.product.name} added to your shopping cart`, 'success');
            openCartDrawer();
          }
        } else if (action === 'wishlist') {
          const res = Store.toggleWishlist(id);
          const icon = actionBtn.querySelector('i');
          if (res.added) {
            actionBtn.classList.add('active-wishlist');
            icon.className = 'bi bi-heart-fill';
            Store.showToast('Added to Wishlist', 'Item saved to your favorites', 'info');
          } else {
            actionBtn.classList.remove('active-wishlist');
            icon.className = 'bi bi-heart';
            Store.showToast('Removed from Wishlist', 'Item removed', 'info');
          }
        } else if (action === 'quickview') {
          openQuickView(id);
        }
        return;
      }

      // Clicking card body opens quick view
      const card = e.target.closest('.product-card');
      if (card && !e.target.closest('button')) {
        const id = parseInt(card.dataset.id, 10);
        openQuickView(id);
      }
    });

    // Cart Drawer Open / Close
    DOM.cartBtn.addEventListener('click', openCartDrawer);
    DOM.btnCloseCart.addEventListener('click', closeCartDrawer);
    DOM.drawerBackdrop.addEventListener('click', closeCartDrawer);

    // Hero Section View Active Cart Button
    const heroCartBtn = document.getElementById('hero-btn-demo-cart');
    if (heroCartBtn) {
      heroCartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openCartDrawer();
      });
    }

    // Header Track Orders Link
    const ordersLink = document.getElementById('header-orders-link');
    if (ordersLink) {
      ordersLink.addEventListener('click', (e) => {
        e.preventDefault();
        openOrdersModal();
      });
    }

    // Order Search Filter Input in Modal
    const orderSearchInput = document.getElementById('order-search-input');
    if (orderSearchInput) {
      orderSearchInput.addEventListener('input', (e) => {
        openOrdersModal(e.target.value);
      });
    }


    // Cart Items Delegation (+, -, remove)
    DOM.cartItemsList.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      const id = parseInt(btn.dataset.id, 10);
      const cartItem = Store.getCart().find(i => i.id === id);

      if (action === 'increase-qty' && cartItem) {
        Store.updateQuantity(id, cartItem.quantity + 1);
      } else if (action === 'decrease-qty' && cartItem) {
        Store.updateQuantity(id, cartItem.quantity - 1);
      } else if (action === 'remove-item') {
        Store.removeFromCart(id);
        Store.showToast('Item Removed', 'Product removed from cart', 'info');
      }
    });

    // Coupon Application
    DOM.btnApplyCoupon.addEventListener('click', () => {
      const code = DOM.couponInput.value.trim();
      if (!code) {
        Store.showToast('Coupon Error', 'Please enter a coupon code', 'error');
        return;
      }
      const res = Store.applyCoupon(code);
      if (res.success) {
        Store.showToast('Success!', res.message, 'success');
        DOM.couponInput.value = '';
      } else {
        Store.showToast('Coupon Error', res.message, 'error');
      }
    });

    // Start Checkout from Cart Drawer
    DOM.btnStartCheckout.addEventListener('click', openCheckout);

    // Checkout Navigation
    DOM.btnProceedStep.addEventListener('click', handleCheckoutNext);
    DOM.btnBackStep.addEventListener('click', () => {
      if (state.activeCheckoutStep > 1) {
        setCheckoutStep(state.activeCheckoutStep - 1);
      }
    });

    // Checkout Step clicks
    DOM.checkoutSteps.forEach((stepNode, idx) => {
      stepNode.addEventListener('click', () => {
        const targetStep = idx + 1;
        if (targetStep < state.activeCheckoutStep) {
          setCheckoutStep(targetStep);
        }
      });
    });

    // Payment Tab Selector in Step 3
    document.querySelectorAll('.pay-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.pay-tab-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const method = e.currentTarget.dataset.method;
        state.checkoutData.paymentMethod = method;

        document.querySelectorAll('.payment-method-content').forEach(p => p.style.display = 'none');
        const targetMethodPanel = document.getElementById(`pay-method-${method}`);
        if (targetMethodPanel) targetMethodPanel.style.display = 'block';
      });
    });

    // Shipping Option Selector in Step 2
    document.querySelectorAll('.shipping-card').forEach(card => {
      card.addEventListener('click', (e) => {
        document.querySelectorAll('.shipping-card').forEach(c => c.classList.remove('selected'));
        const radio = card.querySelector('input[type="radio"]');
        radio.checked = true;
        card.classList.add('selected');
      });
    });

    // Modals Close handlers
    document.querySelectorAll('.btn-modal-close').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });

    // Wishlist Header Button click
    DOM.wishlistBtn.addEventListener('click', filterWishlistItems);

    // User Header Button click (Auth / Profile Modal)
    DOM.userBtn.addEventListener('click', () => {
      const user = Store.getCurrentUser();
      if (user) {
        openOrdersModal();
      } else {
        DOM.authModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });

    // Auth Tabs toggle
    DOM.loginTab.addEventListener('click', () => {
      DOM.loginTab.classList.add('active');
      DOM.registerTab.classList.remove('active');
      DOM.loginForm.style.display = 'block';
      DOM.registerForm.style.display = 'none';
    });

    DOM.registerTab.addEventListener('click', () => {
      DOM.registerTab.classList.add('active');
      DOM.loginTab.classList.remove('active');
      DOM.registerForm.style.display = 'block';
      DOM.loginForm.style.display = 'none';
    });

    // 1-Click Demo Accounts
    document.querySelectorAll('.demo-account-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const email = e.currentTarget.dataset.email;
        const pass = e.currentTarget.dataset.pass;
        document.getElementById('login-email').value = email;
        document.getElementById('login-password').value = pass;
        const res = Store.login(email, pass);
        if (res.success) {
          Store.showToast('Logged In!', `Welcome back, ${res.user.name}`, 'success');
          DOM.authModal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });

    // Login Form Submit
    DOM.loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const pass = document.getElementById('login-password').value;
      const res = Store.login(email, pass);
      if (res.success) {
        Store.showToast('Logged In!', `Welcome back, ${res.user.name}`, 'success');
        DOM.authModal.classList.remove('active');
        document.body.style.overflow = '';
      } else {
        Store.showToast('Login Failed', res.message, 'error');
      }
    });

    // Register Form Submit
    DOM.registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      const phone = document.getElementById('reg-phone').value.trim();
      const address = document.getElementById('reg-address').value.trim();

      const res = Store.register({ name, email, password, phone, address });
      if (res.success) {
        Store.showToast('Account Created!', `Welcome to NexMart, ${res.user.name}`, 'success');
        DOM.authModal.classList.remove('active');
        document.body.style.overflow = '';
      } else {
        Store.showToast('Registration Error', res.message, 'error');
      }
    });

    // Store Event Listeners (Syncing across views)
    window.addEventListener('cart-updated', () => {
      updateHeaderBadges();
      renderCart();
      updateCheckoutSummary();
    });

    window.addEventListener('wishlist-updated', () => {
      updateHeaderBadges();
    });

    window.addEventListener('auth-changed', () => {
      updateUserInterface();
      prefillCheckoutUserData();
    });

    // Expose openCartDrawer and openOrdersModal to global window
    window.openCartDrawer = openCartDrawer;
    window.openOrdersModal = openOrdersModal;

    // Interactive Credit Card Setup
    setupInteractiveCreditCard();
  }

  // Run app
  init();
});

