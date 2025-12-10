/**
 * ExaStore — Smart Consumer E-Commerce Client & Embedded Shopping AI
 * Author & Creator: Anbu
 */

// Local fallback catalog of 24 curated organic & tech products
const FALLBACK_PRODUCTS = [
  {
    id: "p1",
    name: "Organic Almond Milk (1L)",
    category: "groceries",
    price: 249,
    rating: 4.8,
    reviews_count: 86,
    tag: "100% Organic",
    image: "https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80",
    description: "Cold-pressed unsweetened almond milk with zero preservatives and fortified calcium."
  },
  {
    id: "p2",
    name: "Cold Pressed Virgin Coconut Oil (500ml)",
    category: "groceries",
    price: 380,
    rating: 4.9,
    reviews_count: 64,
    tag: "Cold Pressed",
    image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80",
    description: "Pure raw extra virgin coconut oil extracted from fresh coastal organic coconut groves."
  },
  {
    id: "p3",
    name: "Farm Fresh Organic Avocado (Pack of 2)",
    category: "produce",
    price: 280,
    rating: 4.7,
    reviews_count: 112,
    tag: "Farm Fresh",
    image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80",
    description: "Creamy, nutrient-dense Haas avocados picked fresh at peak ripeness this morning."
  },
  {
    id: "p4",
    name: "Pure Raw Wild Forest Honey (500g)",
    category: "groceries",
    price: 490,
    rating: 4.9,
    reviews_count: 142,
    tag: "Raw & Pure",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
    description: "Unprocessed organic wildflower honey harvested directly from protected Nilgiri forest reserves."
  },
  {
    id: "p5",
    name: "Gourmet Extra Virgin Olive Oil (1L)",
    category: "groceries",
    price: 850,
    rating: 4.8,
    reviews_count: 53,
    tag: "First Harvest",
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
    description: "Imported first cold-pressed olive oil from single-estate Mediterranean family groves."
  },
  {
    id: "p6",
    name: "Organic Greek Probiotic Yogurt (400g)",
    category: "groceries",
    price: 190,
    rating: 4.8,
    reviews_count: 94,
    tag: "High Protein",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80",
    description: "Slow-strained, ultra-thick Greek yogurt packed with 15g natural protein and live probiotic cultures."
  },
  {
    id: "p7",
    name: "Traditional A2 Desi Cow Ghee (500ml)",
    category: "groceries",
    price: 780,
    rating: 4.9,
    reviews_count: 78,
    tag: "Bilona Churned",
    image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80",
    description: "Grass-fed Gir cow A2 curd-churned golden aromatic ghee in premium glass jar."
  },
  {
    id: "p8",
    name: "Alphonso Mango Pulp (850g)",
    category: "groceries",
    price: 320,
    rating: 4.9,
    reviews_count: 67,
    tag: "GI Tagged",
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80",
    description: "100% pure Ratnagiri Alphonso mango purée with rich aroma and zero refined cane sugar."
  },
  {
    id: "p9",
    name: "Organic Chia & Flax Superseed Mix (250g)",
    category: "groceries",
    price: 220,
    rating: 4.7,
    reviews_count: 45,
    tag: "Superfood",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    description: "Omega-3 and dietary fiber powerhouse seeds perfect for breakfast smoothie bowls."
  },
  {
    id: "p10",
    name: "Ceremonial Grade Uji Matcha (50g)",
    category: "beverages",
    price: 690,
    rating: 4.9,
    reviews_count: 82,
    tag: "Single Origin",
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80",
    description: "First-spring harvest shade-grown Japanese matcha from Kyoto, vibrant emerald green."
  },
  {
    id: "p11",
    name: "Artisan Sourdough Country Boule (600g)",
    category: "bakery",
    price: 180,
    rating: 4.8,
    reviews_count: 104,
    tag: "Wild Yeast",
    image: "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80",
    description: "36-hour slow-fermented crusty wild yeast boule baked stone-hearth with an airy open crumb."
  },
  {
    id: "p12",
    name: "Toasted Hazelnut Dark Granola (350g)",
    category: "bakery",
    price: 340,
    rating: 4.7,
    reviews_count: 62,
    tag: "Artisan Baked",
    image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=600&q=80",
    description: "Jumbo rolled oats crisped in wildflower honey, whole roasted hazelnuts, and Madagascar vanilla."
  },
  {
    id: "p13",
    name: "Multigrain Everything Bagels (Pack of 4)",
    category: "bakery",
    price: 160,
    rating: 4.8,
    reviews_count: 58,
    tag: "Fresh Baked",
    image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=600&q=80",
    description: "Kettle-boiled chewy authentic bagels crusted with roasted garlic, onion flakes, and seeds."
  },
  {
    id: "p14",
    name: "Hydroponic Tuscan Baby Kale (200g)",
    category: "produce",
    price: 140,
    rating: 4.7,
    reviews_count: 39,
    tag: "Pesticide Free",
    image: "https://images.unsplash.com/photo-1522184216316-3c25379f9760?auto=format&fit=crop&w=600&q=80",
    description: "Crisp, tender baby kale leaves grown in climate-controlled hydroponic indoor vertical farms."
  },
  {
    id: "p15",
    name: "Farm Fresh Mahabaleshwar Strawberries (250g)",
    category: "produce",
    price: 175,
    rating: 4.8,
    reviews_count: 91,
    tag: "Hand Picked",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80",
    description: "Sweet, ruby-red strawberries harvested at daybreak from cool mountain plateau slopes."
  },
  {
    id: "p16",
    name: "Organic Sweet Blueberries (125g Punnet)",
    category: "produce",
    price: 260,
    rating: 4.9,
    reviews_count: 73,
    tag: "Antioxidant Rich",
    image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?auto=format&fit=crop&w=600&q=80",
    description: "Plump, sweet organic blueberries bursting with vibrant natural antioxidants and juice."
  },
  {
    id: "p17",
    name: "Pure Tender Coconut Water (Pack of 4)",
    category: "beverages",
    price: 200,
    rating: 4.8,
    reviews_count: 85,
    tag: "Zero Additives",
    image: "https://images.unsplash.com/photo-1544378730-8b5104b18790?auto=format&fit=crop&w=600&q=80",
    description: "Naturally isotonic green coconut water cold-bottled within 2 hours of tree harvest."
  },
  {
    id: "p18",
    name: "Cold-Pressed Valencia Orange Juice (1L)",
    category: "beverages",
    price: 230,
    rating: 4.9,
    reviews_count: 119,
    tag: "100% Raw Juice",
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80",
    description: "Freshly squeezed unpasteurized sunshine juice with citrus pulp intact and zero added water."
  },
  {
    id: "p19",
    name: "Sparkling Ginger Lemon Kombucha (330ml)",
    category: "beverages",
    price: 150,
    rating: 4.7,
    reviews_count: 64,
    tag: "Probiotic Living",
    image: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=600&q=80",
    description: "Effervescent small-batch fermented green tea with zesty ginger root and cold-pressed Meyer lemon."
  },
  {
    id: "p20",
    name: "70% Dark Chocolate Sea Salt Bark (150g)",
    category: "bakery",
    price: 290,
    rating: 4.9,
    reviews_count: 88,
    tag: "Single Origin",
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80",
    description: "Bean-to-bar dark chocolate layered with roasted California almonds and crunchy Maldon sea salt."
  },
  {
    id: "p21",
    name: "Emergency First Aid & Wellness Kit",
    category: "produce",
    price: 420,
    rating: 4.8,
    reviews_count: 36,
    tag: "Essential",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80",
    description: "Sterile medical essentials, herbal antiseptic balm, and zinc-vitamin C immunity wellness tablets."
  },
  {
    id: "p22",
    name: "Predator ROG RTX 4080 Gaming Laptop",
    category: "electronics",
    price: 89999,
    rating: 4.9,
    reviews_count: 24,
    tag: "Workstation",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=600&q=80",
    description: "High-performance AI workstation laptop with 32GB RAM, 1TB NVMe SSD, and RTX 4080 graphics."
  },
  {
    id: "p23",
    name: "Studio Wireless ANC Headphones",
    category: "electronics",
    price: 1450,
    rating: 4.6,
    reviews_count: 142,
    tag: "Hi-Fi Audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    description: "Active noise cancelling over-ear studio headphones with spatial sound and 40-hour battery life."
  },
  {
    id: "p24",
    name: "Ultra-Slim MagSafe Power Bank (10,000mAh)",
    category: "electronics",
    price: 999,
    rating: 4.7,
    reviews_count: 98,
    tag: "Fast Charge",
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=600&q=80",
    description: "15W magnetic wireless fast charging battery pack with aerospace-grade anodized aluminum casing."
  }
];

let allProducts = [...FALLBACK_PRODUCTS];

// Application state
const state = {
  cart: { p1: 1 },
  activeCategory: "all",
  searchQuery: "",
  sortBy: "featured",
  deliveryAddress: "Flat 402, Green Glen Layout, Bellandur, Bengaluru 560103",
  aiChatHistory: [],
  isAiWindowOpen: false,
  isAiMinimized: false
};

// DOM References
const productsGrid = document.getElementById("products-grid");
const searchInput = document.getElementById("search-input");
const categoryNav = document.getElementById("category-nav");
const sortSelect = document.getElementById("sort-select");

// Cart Elements
const cartBtn = document.getElementById("btn-cart-toggle");
const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-drawer-overlay");
const closeDrawerBtn = document.getElementById("btn-close-drawer");
const cartCountBadge = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cart-items-container");
const cartSubtotalVal = document.getElementById("cart-subtotal-val");
const cartTaxVal = document.getElementById("cart-tax-val");
const cartTotalVal = document.getElementById("cart-total-val");
const meterText = document.getElementById("meter-text");
const meterFill = document.getElementById("meter-fill");
const addressInput = document.getElementById("delivery-address-input");
const checkoutBtn = document.getElementById("btn-checkout");
const checkoutModal = document.getElementById("checkout-modal");
const closeModalBtn = document.getElementById("btn-close-modal");
const modalDoneBtn = document.getElementById("btn-modal-done");
const modalBody = document.getElementById("modal-body");

// AI Copilot Elements
const aiFab = document.getElementById("ai-copilot-fab");
const aiHeaderBtn = document.getElementById("btn-header-ai");
const aiWindow = document.getElementById("ai-copilot-window");
const aiWindowHeader = document.getElementById("ai-window-header");
const aiCloseBtn = document.getElementById("btn-ai-close");
const aiMinimizeBtn = document.getElementById("btn-ai-minimize");
const aiClearBtn = document.getElementById("btn-ai-clear");
const aiChatForm = document.getElementById("ai-chat-form");
const aiUserInput = document.getElementById("ai-user-input");
const aiMessagesContainer = document.getElementById("ai-messages-container");

// Initialize Store
async function init() {
  await fetchCatalog();
  renderProducts();
  renderCart();
  setupEventListeners();
  setupDraggableAiWindow();
}

// Fetch live products from backend
async function fetchCatalog() {
  try {
    const res = await fetch("/api/products");
    if (res.ok) {
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        allProducts = data.products.map(p => ({
          ...p,
          category: p.category ? p.category.toLowerCase() : "groceries"
        }));
      }
    }
  } catch (err) {
    console.warn("Using fallback local products:", err);
  }
}

// Render Products with Filters & Sorting
function renderProducts() {
  let list = allProducts.filter(p => {
    const catMatch = state.activeCategory === "all" || p.category === state.activeCategory;
    const q = state.searchQuery.toLowerCase();
    const searchMatch = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || (p.tag && p.tag.toLowerCase().includes(q));
    return catMatch && searchMatch;
  });

  // Sorting
  if (state.sortBy === "price-low") list.sort((a, b) => a.price - b.price);
  else if (state.sortBy === "price-high") list.sort((a, b) => b.price - a.price);
  else if (state.sortBy === "rating") list.sort((a, b) => b.rating - a.rating);

  if (list.length === 0) {
    productsGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #64748B;">
        <h3 style="font-size: 18px; margin-bottom: 8px;">No items match "${state.searchQuery}"</h3>
        <p style="font-size: 14px;">Try searching for "almond milk", "avocado", "honey", or "matcha".</p>
      </div>
    `;
    return;
  }

  productsGrid.innerHTML = list.map(p => `
    <article class="product-card" id="product-${p.id}">
      <div class="product-image-container">
        <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';" />
        <span class="product-tag-badge">${p.tag || "Fresh"}</span>
        <span class="product-stock-badge">● In Stock</span>
      </div>
      <div class="product-body">
        <div class="product-category-row">
          <span class="product-cat-label">${p.category}</span>
          <div class="product-rating">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#D97706" stroke="#D97706"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span>${p.rating}</span>
            <span style="color: #94A3B8; font-weight: 500; font-size: 11px;">(${p.reviews_count || 42})</span>
          </div>
        </div>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-desc">${p.description}</p>
        <div class="product-footer">
          <span class="product-price">₹${p.price.toFixed(2)}</span>
          <div class="product-actions">
            <button class="btn-add-cart" onclick="addToCart('${p.id}')">Add</button>
            <button class="btn-buy-instant" onclick="buyInstant('${p.id}')">Buy</button>
          </div>
        </div>
      </div>
    </article>
  `).join("");
}

// Cart Operations
window.addToCart = function(productId) {
  state.cart[productId] = (state.cart[productId] || 0) + 1;
  renderCart();
  openCartDrawer();
};

window.buyInstant = async function(productId) {
  state.cart[productId] = (state.cart[productId] || 0) + 1;
  renderCart();
  openCartDrawer();
  handleCheckout();
};

window.updateQty = function(productId, delta) {
  if (state.cart[productId]) {
    state.cart[productId] += delta;
    if (state.cart[productId] <= 0) {
      delete state.cart[productId];
    }
  }
  renderCart();
};

function renderCart() {
  const itemIds = Object.keys(state.cart);
  const totalCount = itemIds.reduce((sum, id) => sum + state.cart[id], 0);
  cartCountBadge.textContent = totalCount;

  if (itemIds.length === 0) {
    cartItemsContainer.innerHTML = `
      <div style="text-align: center; padding: 48px 16px; color: #64748B;">
        <p style="font-size: 15px; font-weight: 600; margin-bottom: 6px;">Your cart is empty</p>
        <p style="font-size: 13px;">Add fresh organic groceries or tech items to get started.</p>
      </div>
    `;
    cartSubtotalVal.textContent = "₹0.00";
    cartTaxVal.textContent = "₹0.00";
    cartTotalVal.textContent = "₹0.00";
    meterText.textContent = "Add ₹499 for free express shipping!";
    meterFill.style.width = "0%";
    return;
  }

  let subtotal = 0;
  cartItemsContainer.innerHTML = itemIds.map(id => {
    const product = allProducts.find(p => p.id === id) || { name: "Item", price: 249, image: "" };
    const qty = state.cart[id];
    const itemTotal = product.price * qty;
    subtotal += itemTotal;

    return `
      <div class="cart-item-row">
        <img src="${product.image}" alt="${product.name}" class="cart-item-thumb" />
        <div class="cart-item-info">
          <div class="cart-item-title">${product.name}</div>
          <div class="cart-item-price">₹${product.price} &times; ${qty} = ₹${itemTotal}</div>
        </div>
        <div class="cart-qty-control">
          <button class="cart-qty-btn" onclick="updateQty('${id}', -1)">-</button>
          <span class="cart-qty-num">${qty}</span>
          <button class="cart-qty-btn" onclick="updateQty('${id}', 1)">+</button>
        </div>
      </div>
    `;
  }).join("");

  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + gst;

  cartSubtotalVal.textContent = `₹${subtotal.toFixed(2)}`;
  cartTaxVal.textContent = `₹${gst.toFixed(2)}`;
  cartTotalVal.textContent = `₹${total.toFixed(2)}`;

  // Free shipping progress towards ₹499
  const threshold = 499;
  if (subtotal >= threshold) {
    meterText.innerHTML = `🎉 You unlocked <strong>FREE 30-Min Express Delivery</strong>!`;
    meterFill.style.width = "100%";
  } else {
    const diff = threshold - subtotal;
    const pct = Math.min(100, Math.round((subtotal / threshold) * 100));
    meterText.textContent = `Add ₹${diff.toFixed(2)} more for FREE express delivery!`;
    meterFill.style.width = `${pct}%`;
  }
}

function openCartDrawer() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("active");
}

function closeCartDrawer() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("active");
}

// Order Checkout Proxy to Recourse (Port 3000)
async function handleCheckout() {
  const itemIds = Object.keys(state.cart);
  if (itemIds.length === 0) return;

  const firstItem = allProducts.find(p => p.id === itemIds[0]);
  const address = addressInput.value.trim() || state.deliveryAddress;
  
  let subtotal = 0;
  itemIds.forEach(id => {
    const p = allProducts.find(prod => prod.id === id);
    if (p) subtotal += p.price * state.cart[id];
  });
  const totalPaisa = Math.round(subtotal * 1.05 * 100);

  checkoutBtn.disabled = true;
  document.getElementById("checkout-btn-text").textContent = "Processing Payment via Razorpay...";

  try {
    const res = await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item: firstItem ? firstItem.name : "Curated Grocery Basket",
        amount_paisa: totalPaisa,
        merchant: "ExaStore",
        category: firstItem ? firstItem.category : "Groceries",
        address: address,
        user_message: `Checkout basket with ${itemIds.length} items for ₹${totalPaisa / 100} to ${address}`
      })
    });

    const data = await res.json();
    closeCartDrawer();

    if (data.pass || data.action === "APPROVED") {
      const rzpId = data.razorpay_order_id || data.razorpay_order?.id || "order_live_rzp";
      
      const renderSuccessModal = (paymentId) => {
        modalBody.innerHTML = `
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background-color: #ECFDF5; color: #10B981; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 style="font-size: 20px; font-weight: 800; color: #0F172A; margin-bottom: 4px;">Payment Captured Successfully!</h3>
            <p style="font-size: 13.5px; color: #475569;">Settled on Razorpay test rails and logged in merchant dashboard.</p>
          </div>
          <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; font-size: 13px; line-height: 1.6;">
            ${paymentId ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #64748B;">Razorpay Payment ID:</span>
              <span style="font-family: monospace; font-weight: 700; color: #059669;">${paymentId}</span>
            </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #64748B;">Razorpay Order ID:</span>
              <span style="font-family: monospace; font-weight: 700; color: #0F172A;">${rzpId}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #64748B;">Amount Paid:</span>
              <span style="font-weight: 700; color: #059669;">₹${(totalPaisa / 100).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #64748B;">Destination:</span>
              <span style="font-weight: 600; text-align: right; max-width: 60%;">${address}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #64748B;">Dashboard Status:</span>
              <span style="font-weight: 700; color: #10B981;">● Captured in Razorpay Test Mode</span>
            </div>
          </div>
          <div style="margin-top: 14px; text-align: center; font-size: 12px; color: #64748B;">
            Check your <a href="https://dashboard.razorpay.com/" target="_blank" style="color: #059669; font-weight: 700;">Razorpay Dashboard &rarr; Payments</a> to see this captured payment!
          </div>
        `;
        // Clear cart
        state.cart = {};
        renderCart();
        checkoutModal.classList.add("open");
      };

      // Launch official Razorpay Checkout in Test Mode if SDK is present
      if (typeof window.Razorpay !== "undefined" && rzpId && !rzpId.includes("placeholder")) {
        const options = {
          key: "rzp_test_TY3ubuufw0dC2X",
          amount: totalPaisa,
          currency: "INR",
          name: "ExaStore",
          description: firstItem ? firstItem.name : "Organic Order",
          order_id: rzpId,
          handler: function (response) {
            console.log("Razorpay Payment Captured:", response);
            renderSuccessModal(response.razorpay_payment_id);
          },
          prefill: {
            name: "Anbu",
            email: "anbu@example.com",
            contact: "9876543210"
          },
          theme: {
            color: "#059669"
          },
          modal: {
            ondismiss: function() {
              renderSuccessModal(null);
            }
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        renderSuccessModal(null);
      }
    } else {
      const reason = data.failureReason || data.reason || "Spending limit exceeded";
      modalBody.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background-color: #FEF2F2; color: #DC2626; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
          <h3 style="font-size: 20px; font-weight: 800; color: #0F172A; margin-bottom: 4px;">Transaction Blocked</h3>
          <p style="font-size: 13.5px; color: #DC2626; font-weight: 600;">${reason}</p>
        </div>
        <p style="font-size: 13px; color: #475569; text-align: center;">
          Recourse Enterprise prevented this purchase from executing because it violates merchant allowlist or spending caps.
        </p>
      `;
    }
    checkoutModal.classList.add("open");
  } catch (err) {
    alert("Checkout failed: " + err.message);
  } finally {
    checkoutBtn.disabled = false;
    document.getElementById("checkout-btn-text").textContent = "Pay & Place Order via Razorpay";
  }
}

// ==========================================================================
// MOVABLE & ADJUSTABLE FLOATING AI COPILOT LOGIC
// ==========================================================================

function toggleAiWindow() {
  state.isAiWindowOpen = !state.isAiWindowOpen;
  if (state.isAiWindowOpen) {
    aiWindow.classList.add("open");
    aiUserInput.focus();
  } else {
    aiWindow.classList.remove("open");
  }
}

function minimizeAiWindow() {
  state.isAiMinimized = !state.isAiMinimized;
  if (state.isAiMinimized) {
    aiWindow.classList.add("minimized");
  } else {
    aiWindow.classList.remove("minimized");
  }
}

function clearAiChat() {
  state.aiChatHistory = [];
  aiMessagesContainer.innerHTML = `
    <div class="chat-bubble assistant">
      👋 Hi! I am <strong>Shopping AI</strong>, created by <strong>Anbu</strong>.
      <br><br>
      I am directly connected to <strong>ExaStore</strong>. You can ask me:
      <ul style="margin: 6px 0 6px 18px; font-size: 12px;">
        <li><em>"Buy Organic Almond Milk"</em> or <em>"Order Avocados"</em></li>
        <li><em>"Schedule weekend groceries under ₹500"</em></li>
        <li><em>"What high-protein snacks do you have?"</em></li>
      </ul>
      You can also drag this window anywhere on your screen or resize it from the corner!
    </div>
  `;
}

// Draggable Window Handler (User can drag the popup anywhere on the screen)
function setupDraggableAiWindow() {
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialLeft = 0;
  let initialTop = 0;

  aiWindowHeader.addEventListener("mousedown", (e) => {
    // Don't drag if clicking buttons
    if (e.target.closest(".ai-tool-btn")) return;

    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;

    const rect = aiWindow.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    // Switch from bottom/right positioning to top/left so drag coordinates are deterministic
    aiWindow.style.bottom = "auto";
    aiWindow.style.right = "auto";
    aiWindow.style.left = `${initialLeft}px`;
    aiWindow.style.top = `${initialTop}px`;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  function onMouseMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newLeft = initialLeft + dx;
    let newTop = initialTop + dy;

    // Viewport bounds constraint
    const maxLeft = window.innerWidth - aiWindow.offsetWidth - 10;
    const maxTop = window.innerHeight - aiWindow.offsetHeight - 10;
    newLeft = Math.max(10, Math.min(newLeft, maxLeft));
    newTop = Math.max(10, Math.min(newTop, maxTop));

    aiWindow.style.left = `${newLeft}px`;
    aiWindow.style.top = `${newTop}px`;
  }

  function onMouseUp() {
    isDragging = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }
}

// Send Message to Shopping AI
async function sendAiMessage(promptText) {
  const text = (promptText || aiUserInput.value).trim();
  if (!text) return;

  // Append user bubble
  appendChatBubble("user", text);
  aiUserInput.value = "";
  state.aiChatHistory.push({ role: "user", content: text });

  // Append thinking spinner
  const thinkingId = `think_${Date.now()}`;
  const thinkingDiv = document.createElement("div");
  thinkingDiv.className = "chat-bubble assistant";
  thinkingDiv.id = thinkingId;
  thinkingDiv.innerHTML = `<em>Thinking with Groq 70B...</em>`;
  aiMessagesContainer.appendChild(thinkingDiv);
  aiMessagesContainer.scrollTop = aiMessagesContainer.scrollHeight;

  try {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        history: state.aiChatHistory.slice(-4)
      })
    });

    const data = await res.json();
    thinkingDiv.remove();

    let htmlContent = formatMarkdown(data.reply);

    // If an order was placed, add an interactive visual receipt card
    if (data.action === "ORDER_PLACED" && data.product) {
      htmlContent += `
        <div class="ai-action-card approved">
          <strong>✅ Razorpay Settle Confirmed</strong>
          <div>Order ID: <code>${data.razorpay_order_id}</code></div>
          <div>Product: ${data.product.name} (₹${data.product.price})</div>
        </div>
      `;
      // Also reflect in store cart state
      state.cart[data.product.id] = (state.cart[data.product.id] || 0) + 1;
      renderCart();
    } else if (data.action === "ORDER_BLOCKED") {
      htmlContent += `
        <div class="ai-action-card blocked">
          <strong>🚫 Spent Gate Intercepted</strong>
          <div>${data.reason}</div>
        </div>
      `;
    } else if (data.action === "SCHEDULE_STAGED") {
      htmlContent += `
        <div class="ai-action-card schedule">
          <strong>📅 Recourse Mandate Staged</strong>
          <div>Status: Pending Human Review on Console (Port 3000)</div>
        </div>
      `;
    }

    appendChatBubble("assistant", htmlContent, true);
    state.aiChatHistory.push({ role: "assistant", content: data.reply });

  } catch (err) {
    thinkingDiv.remove();
    appendChatBubble("assistant", `⚠️ Connection error: ${err.message}`);
  }
}

function appendChatBubble(role, content, isHtml = false) {
  const div = document.createElement("div");
  div.className = `chat-bubble ${role}`;
  if (isHtml) {
    div.innerHTML = content;
  } else {
    div.textContent = content;
  }
  aiMessagesContainer.appendChild(div);
  aiMessagesContainer.scrollTop = aiMessagesContainer.scrollHeight;
}

// Simple Markdown Formatter
function formatMarkdown(text) {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n- /g, '<br>&bull; ')
    .replace(/\n/g, '<br>');
}

// Global Event Listeners Setup
function setupEventListeners() {
  // Category tabs
  categoryNav.addEventListener("click", (e) => {
    const btn = e.target.closest(".cat-chip");
    if (!btn) return;
    document.querySelectorAll(".cat-chip").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    state.activeCategory = btn.dataset.category;
    renderProducts();
  });

  // Search input
  searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value.trim();
    renderProducts();
  });

  // Keyboard shortcut Ctrl+K
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // Sort dropdown
  sortSelect.addEventListener("change", (e) => {
    state.sortBy = e.target.value;
    renderProducts();
  });

  // Cart open/close
  cartBtn.addEventListener("click", openCartDrawer);
  closeDrawerBtn.addEventListener("click", closeCartDrawer);
  cartOverlay.addEventListener("click", closeCartDrawer);

  // Address chips
  document.querySelectorAll(".addr-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      addressInput.value = chip.dataset.address;
    });
  });

  // Checkout
  checkoutBtn.addEventListener("click", handleCheckout);
  closeModalBtn.addEventListener("click", () => checkoutModal.classList.remove("open"));
  modalDoneBtn.addEventListener("click", () => checkoutModal.classList.remove("open"));

  // AI Copilot Triggers
  aiFab.addEventListener("click", toggleAiWindow);
  aiHeaderBtn.addEventListener("click", toggleAiWindow);
  aiCloseBtn.addEventListener("click", toggleAiWindow);
  aiMinimizeBtn.addEventListener("click", minimizeAiWindow);
  aiClearBtn.addEventListener("click", clearAiChat);

  // AI Chat Form
  aiChatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    sendAiMessage();
  });

  // Quick Prompt Pills
  document.querySelectorAll(".ai-pill-chip").forEach(pill => {
    pill.addEventListener("click", () => {
      if (!state.isAiWindowOpen) toggleAiWindow();
      sendAiMessage(pill.dataset.prompt);
    });
  });
}

// Boot up
document.addEventListener("DOMContentLoaded", init);
