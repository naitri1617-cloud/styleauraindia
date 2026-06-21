# StyleAura India - Multi-Tier Connected E-Commerce System

StyleAura India is a modern, premium Indian fashion and lifestyle e-commerce application designed as a **multi-tier connected system**. It features a separate Customer Website, a secure Admin Dashboard Portal, and a Node.js + Express API Backend Server connected to a local JSON file database.

All prices are in Indian Rupees (₹), and logistics forms support PIN Code validation, state selections, Cash on Delivery, and UPI mock payments.

---

## 🏢 System Architecture

The project has been consolidated into a single-domain unified service running exclusively on **port 80** (HTTP):

1. **`/` (Customer Storefront)**
   - Path: Served from `/customer/dist` (built React application)
   - URL: `http://www.styleauraindia.com/`
   - Supports browsing products, categories filtering, shopping cart checkout, and real-time order tracking.

2. **`/admin` (Admin Console)**
   - Path: Served from `/admin/dist` (built React application)
   - URL: `http://www.styleauraindia.com/admin/`
   - Supports secure login (`admin@styleauraindia.com`/`admin123`), statistics overview, product management (Add, Edit, Delete), and order status dispatches.

3. **`/backend-dashboard` (Secure Backend Ledger)**
   - Path: Server-side rendered (SSR) EJS-style CSS tables
   - URL: `http://www.styleauraindia.com/backend-dashboard`
   - Password-protected with security checkpoint (password: `admin123`). Shows interactive, live tables of Products, Orders, and Customers.

4. **`/api` (Backend REST API)**
   - Path: Express routes (`server/server.js`)
   - Handles product catalog, checkout actions, order status mutations, and tracking.

---

## 📊 Directory Overview

```text
/clg-project
├── /customer            # React + Vite customer website
│   ├── /src
│   │   ├── /components  # ShopPage, Navbar, Hero, CheckoutModal, etc.
│   │   ├── /context     # CartContext.jsx (Uses relative API paths)
│   │   ├── App.jsx      # Navigation views router
│   │   └── main.jsx     # Root renderer
│   ├── index.html
│   └── vite.config.js   # Built with relative assets
│
├── /admin               # React + Vite admin dashboard panel
│   ├── /src
│   │   ├── App.jsx      # Authentication & Inventory/Order CRUD dashboard
│   │   └── main.jsx     # Root renderer
│   ├── index.html
│   └── vite.config.js   # Base path set to '/admin/'
│
└── /server              # Consolidated backend & static files distributor
    ├── db.json          # Seeded product inventory & order logs
    └── server.js        # Express listener (port 80)
```

---

## 📡 API Reference Schema

All endpoints and frontends are served on `http://www.styleauraindia.com`.

### Product Routes
- `GET /api/products` - Returns all catalog items.
- `GET /api/products/:id` - Returns details of a specific product.
- `POST /api/products` - Inserts a new style product (Admin).
- `PUT /api/products/:id` - Edits an existing product's pricing/stock (Admin).
- `DELETE /api/products/:id` - Deletes a product from style sheets (Admin).

### Order Routes
- `GET /api/orders` - Lists all customer purchases (Admin).
- `GET /api/orders/:id` - Returns order status matches for order ID or Mobile (Tracking).
- `POST /api/orders` - Places a new purchase order (Customer checkout, decrements stock).
- `PUT /api/orders/:id/status` - Modifies dispatch status: `Pending`, `Processing`, `Shipped`, `Delivered`, `Cancelled` (Admin).

### Admin Routes
- `POST /api/admin/login` - Authenticates credentials (`admin@styleauraindia.com` / `admin123`).

### HTML Table Data Viewer Routes (Password: `admin123`)
- `GET /backend-dashboard` - Access the ledger portal (tab query param options: `?tab=products`, `?tab=orders`, `?tab=customers`).
- `GET /backend-dashboard/logout` - Revokes system credentials and redirects.
- `GET /products-table` - Redirects to authenticated Products ledger.
- `GET /orders-table` - Redirects to authenticated Orders ledger.
- `GET /customers-table` - Redirects to authenticated Customers ledger.

---

## 🚀 Building & Running the System

To serve everything on port 80 (HTTP), you must first compile the production builds of the frontends so Express can serve them.

### Step 1: Install Dependencies
Run in each subfolder:

```bash
# For Customer
cd customer
npm install

# For Admin
cd admin
npm install

# For Server
cd server
npm install
```

### Step 2: Compile Production Builds
Build the frontend assets:

```bash
# Compile Customer
cd customer
npm run build

# Compile Admin
cd admin
npm run build
```

This compiles static assets into `customer/dist` and `admin/dist`.

### Step 3: Run the Server
```bash
cd server
npm start
```

Your system is now fully live on **`http://www.styleauraindia.com/`**!
- Storefront: `http://www.styleauraindia.com/`
- Admin Console: `http://www.styleauraindia.com/admin`
- Backend Data Console: `http://www.styleauraindia.com/backend-dashboard` (Password: `admin123`)

---

## 🌐 Live Cloud & Render Deployment Guide

Follow these steps to deploy StyleAura India to a live server (VPS, AWS, Heroku, Render, etc.) with a custom domain:

### 🚀 Deploying to Render (Consolidated Web Service)
You can deploy this entire application (Customer, Admin, and Server) as a single **Render Web Service**:

1. **Create a New Service**:
   - Log in to your Render dashboard and click **New > Web Service**.
   - Connect your GitHub repository containing the project.

2. **Configure Settings**:
   - **Environment**: `Node`
   - **Build Command**: `npm run build` (This runs the unified build scripts that install dependencies and compile both frontend apps).
   - **Start Command**: `npm start` (This starts the backend Express server from the root directory).

3. **Set Environment Variables**:
   Under the **Environment** tab, click **Add Environment Variable**:
   - `PORT`: Define the port number (Render automatically injects its port, but you can set this if needed).
   - `NODE_ENV`: Set to `production`.

4. **Connect Custom Domain**:
   - Go to the **Settings** tab of your service.
   - Scroll down to the **Custom Domains** section and add `www.styleauraindia.com`.
   - Update your registrar's DNS settings as shown in the DNS configuration section below.

---

### 🛠️ Generic VPS / Cloud Server Deployment

#### 1. Install Dependencies
Ensure Node.js is installed on your cloud server. Run the install script inside the subdirectories:
```bash
# In the root repository folder
cd customer && npm install
cd ../admin && npm install
cd ../server && npm install
```

#### 2. Compile Customer & Admin Production Bundles
Build both React applications to compile optimized static assets:
```bash
# Build Customer storefront
cd customer && npm run build

# Build Admin dashboard console
cd ../admin && npm run build
```
This generates the `/customer/dist` and `/admin/dist` directories. The Express server is preconfigured to serve these static build folders natively.

#### 3. Setting Environment Variables
Configure the following environment variables in your hosting provider's dashboard or a local `.env` file in the `/server` folder:
- `PORT`: Define the port number (e.g., `80` for standard HTTP, or custom port like `8080`). Express will bind to `process.env.PORT` automatically.
- `NODE_ENV`: Set to `production`.

#### 4. Database Setup & Live Options (SQLite or MongoDB)
The application currently uses a lightweight, transactional JSON database (`db.json`) located in the `/server` directory. This works out of the box and persists order logs and product catalogs securely.

If you wish to upgrade to a production database:
- **SQLite**:
  1. Install the SQLite driver: `npm install sqlite3` (or `better-sqlite3`).
  2. Implement an adapter inside `server/server.js` replacing `readDB()` and `writeDB()` queries with SQLite `db.all` or `db.run` statements.
- **MongoDB**:
  1. Install Mongoose: `npm install mongoose`.
  2. Connect to your database URI inside `server/server.js` using `mongoose.connect(process.env.MONGODB_URI)`.
  3. Define schemas for `Product` and `Order` collections and swap CRUD handlers.

#### 5. Start the Live Server
Start the Express server on your cloud instance:
```bash
cd server
npm start
```
For continuous uptime, it is recommended to run the process using a manager like PM2:
```bash
npm install -g pm2
pm2 start server.js --name "styleaura-india"
```

---

### 🌐 Connecting Domain DNS
To bind the custom domain `www.styleauraindia.com` to your live instance:
1. Log into your Domain Registrar (e.g., GoDaddy, Namecheap, Google Domains).
2. Navigate to the **DNS Management** panel.
3. Add an **A Record**:
   - Host: `@` (points the root domain `styleauraindia.com`)
   - Value: Your cloud server's public IP address (or Render's load balancer IP)
4. Add a **CNAME Record**:
   - Host: `www` (points the subdomain `www.styleauraindia.com`)
   - Value: Your platform's URL endpoint (e.g., `your-app-name.onrender.com` or root domain)
5. Save changes and wait for DNS propagation (takes 5 minutes to 24 hours).

---

### 📝 Final Deployed URL Structure
Once DNS propagates, the following relative paths resolve automatically under the root server host:
- **Customer Storefront**: `https://www.styleauraindia.com/` (Home, collection, cart, and tracking views)
- **Admin Dashboard**: `https://www.styleauraindia.com/admin` (Manage products and dispatch statuses)
- **Backend Ledger Dashboard**: `https://www.styleauraindia.com/backend-dashboard` (Protected analytics tables; enter password `admin123`)
- **API Endpoints**:
  - `https://www.styleauraindia.com/api/products` (Catalog JSON feed)
  - `https://www.styleauraindia.com/api/orders` (Orders ledger JSON feed)

---

## 🏢 Business Contact Details (Demo)
- **Business Name**: StyleAura India
- **Address**: 302, Fashion Hub, Ring Road, Surat, Gujarat 395002, India
- **Phone**: +91 98765 43210
- **Email**: support@styleauraindia.com
- **Working Hours**: Monday to Saturday, 10:00 AM to 7:00 PM
