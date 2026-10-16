# NexMart — Luxury Electronics Online Shopping Cart
**College NTCC Project (Web Development Domain)**

---

## 🌟 Project Overview
**NexMart** is an e-commerce web application engineered specifically for an academic evaluation / college project submission in the **Web Development domain**. It models an end-to-end online shopping platform featuring a luxury warm white and cream aesthetic, champagne amber gold accents, responsive glassmorphism components, client-side relational storage (`localStorage`), 80 electronics products across 7 categories, and a 4-step checkout pipeline with instant tax invoice generation.

---

## 🚀 Key Features

### 1. 🛍️ Rich Product Database & Filtering (80+ Items)
* **Categories:**
  * 📱 **Smartphones & Foldables:** iPhone 15 Pro Max, Galaxy S24 Ultra, Pixel 9 Pro XL, OnePlus 12, Z Fold 6, etc.
  * 💻 **Laptops & PCs:** MacBook Pro 16" M3 Max, Dell XPS 16 4K OLED, ROG Zephyrus G16, ThinkPad X1 Carbon, etc.
  * 🎧 **Audio & Sound:** Sony WH-1000XM5, AirPods Max, Bose QC Ultra, Marshall Stanmore III, etc.
  * ⌚ **Wearables & Smartwatches:** Apple Watch Ultra 2, Galaxy Watch Ultra, Garmin Fenix 7 Pro Sapphire Solar, etc.
  * 📟 **Tablets & iPads:** iPad Pro 13" M4 Tandem OLED, Galaxy Tab S9 Ultra 14.6", Surface Pro 11, etc.
  * 📷 **Cameras & Drones:** Sony A7 IV, Fujifilm X-T5, Canon R6 Mark II, DJI Pocket 3, DJI Mini 4 Pro, etc.
  * 🔌 **Gear & Accessories:** Samsung T7 Shield 2TB SSD, Logitech MX Master 3S, Keychron Q1 Max CNC Keyboard, etc.
* **Instant Filters:** Category filter pills, brand checklist, price range slider (₹1,000 – ₹4,50,000), customer star rating filter (4.8+, 4.5+, 4.0+).
* **Live Search with Autocomplete:** Dynamic search suggestions with thumbnails, brand, and real-time INR prices.
* **Grid & List Views:** Instant toggle between 3-column card grid and detailed list view.

---

### 2. ⚡ Modern UI/UX Design System
* **Curated Color Palette:** Warm Ivory canvas (`#fcfbf9`), Cashmere Cream secondary layer (`#f4eee3`), pure elevated white cards (`#ffffff`), and Champagne Amber-Gold accents (`#c87a12`).
* **Micro-Animations:** Hover depth lifts, animated countdown timers, heart wishlisting micro-interactions, smooth slide-out drawers, and celebratory checkmark popups.
* **Quick View Modal:** Full product gallery preview, specifications sheet, real-time stock meter, and 1-click cart addition.

---

### 3. 🛒 Interactive Cart Drawer & Coupon Engine
* **Off-Canvas Slide-over Drawer:** Instant cart access with zero page reload.
* **Quantity Controls:** Dynamic `+` and `-` quantity updates with stock limit guardrails.
* **Free Express Shipping Progress Meter:** Dynamic percentage bar showing how much more to add to unlock free shipping (Threshold: ₹1,000).
* **Coupon Codes Engine:**
  * `COLLEGE20`: 20% discount up to ₹5,000 for college students.
  * `WELCOME10`: 10% discount up to ₹2,000 on first order.
  * `FESTIVE500`: Flat ₹500 discount on orders above ₹2,000.
  * `NEXMARTPRO`: 15% discount up to ₹10,000 for Pro tier accounts.

---

### 4. 💳 4-Step Checkout Pipeline
1. **Step 1: Shipping Address:** Customer details, phone number, multi-line street address, city, state, and 6-digit PIN code with input validation.
2. **Step 2: Delivery Speed Options:**
   * Standard Express (2–3 Days, Free)
   * Priority Next-Day Air Flight (+₹199)
   * Ultra-Priority Same-Day Van Delivery (+₹499)
3. **Step 3: Interactive Payment Gateway Simulation:**
   * **Credit / Debit Card:** Real-time 3D interactive visual credit card that flips and renders cardholder name, masked number (`4111 2222...`), and expiry date as the user types.
   * **UPI / QR Code:** Real-time dynamic QR code generator, UPI ID (`nexmart.store@icici`), and simulation for Google Pay, PhonePe, and Paytm.
   * **Net Banking:** Popular banking partner selectors (HDFC, ICICI, SBI, Axis).
   * **Cash on Delivery (COD):** Doorstep payment with OTP verification simulation.
4. **Step 4: Order Confirmation & Live Timeline:**
   * Green celebratory animation, generated unique Order ID (`NEX-XXXXXX`), and tracking number (`TRKXXXXXXXXX`).
   * 5-step visual delivery timeline: **Confirmed ➔ Packed ➔ Shipped ➔ Out for Delivery ➔ Delivered**.
   * **Download / Print Tax Invoice:** Generates an official, printable tax invoice formatted with GSTIN, itemized billing, and customer delivery address.

---

### 5. 🔐 Authentication & Demo Profiles
* **Pre-seeded 1-Click Demo Accounts:**
  * 🎓 **Student Account:** `student@college.edu` / `student123` (Aryan Sharma, Delhi Campus)
  * 💎 **Pro Account:** `pro@nexmart.com` / `pro123` (Priya Patel, Corporate Noida)
* **Register New Accounts:** Real-time user registration saved into `localStorage`.
* **Order History Modal:** View previous and current orders, track status, and re-download invoices anytime.

---

## 📁 Project Architecture & File Structure

```
d:/College NTCC/Shopping cart/
│
├── index.html           # Main Storefront layout, Modals, Header, Hero, Catalog & Footer
├── login.html           # Dedicated Login & Registration Page (Warm White & Cream Theme)
├── css/
│   └── style.css        # Luxury Ivory & Cream Theme, Glassmorphism, Responsive Grid & Animations
├── js/
│   ├── store.js         # LocalStorage State Manager (Cart, User, Orders, Coupons, Wishlist)
│   └── app.js           # Interactive UI Controller, Search, Filters, Stepper & Invoices
├── data/
│   └── products.js      # 80+ Electronics Database with Specs, Images, Badges, Coupons
└── README.md            # Comprehensive Project Documentation & Viva Guide
```

---

## 🖥️ How to Run the Project Locally

### Method 1: Using Python HTTP Server (Recommended)
Open terminal in the project folder and run:
```bash
python -m http.server 3000
```
Then visit **`http://localhost:3000`** in any web browser.

### Method 2: Direct File Execution
Double-click `index.html` or open it directly in any modern browser (Chrome, Edge, Firefox, Safari).

---

## 🎓 Viva & Evaluation Questions (Ready Answers)

1. **Q: How is data stored without a backend database like MySQL or MongoDB?**
   * *A:* The project utilizes HTML5 `localStorage` as a client-side relational storage engine. It persists cart items, active user sessions, order history, and coupon states across page refreshes.

2. **Q: How does the live search autocomplete work?**
   * *A:* An event listener on the search input debounces user keystrokes, performs case-insensitive regex filtering against the `PRODUCTS_DB` array, and renders matching product snippets with thumbnail and price in an absolute-positioned dropdown.

3. **Q: How are order invoices generated?**
   * *A:* When an order completes, `printInvoice(order)` synthesizes an HTML document on the fly in a new window, populating itemized pricing, tax breakdowns, shipping addresses, and triggers `window.print()` for PDF export or paper printing.
