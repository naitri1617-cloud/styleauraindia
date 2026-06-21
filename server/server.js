import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db.json');

const app = express();
const PORT = process.env.PORT || 80;

// Enable CORS, JSON, and URL-encoded body parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper function to read from JSON database file
async function readDB() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file, resetting fields', err);
    return { products: [], orders: [] };
  }
}

// Helper function to write back to JSON database file
async function writeDB(data) {
  try {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to database file', err);
  }
}

// ================= PRODUCT ROUTE HANDLERS =================

// GET /api/products - Get all products
app.get('/api/products', async (req, res) => {
  const db = await readDB();
  res.json(db.products);
});

// GET /api/products/:id - Get a single product
app.get('/api/products/:id', async (req, res) => {
  const db = await readDB();
  const product = db.products.find(p => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// POST /api/products - Add a new product (Admin)
app.post('/api/products', async (req, res) => {
  const db = await readDB();
  const newProduct = req.body;

  if (!newProduct.name || !newProduct.price) {
    return res.status(400).json({ error: 'Product Name and Price are required' });
  }

  const newProdRecord = {
    ...newProduct,
    id: `prod-${Date.now()}`,
    price: parseFloat(newProduct.price),
    stock: parseInt(newProduct.stock || 0, 10),
    rating: parseFloat(newProduct.rating || 5.0),
    reviewsCount: parseInt(newProduct.reviewsCount || 0, 10),
    gradient: newProduct.gradient || 'from-indigo-100 to-indigo-200',
    textGradient: newProduct.textGradient || 'text-indigo-800',
    accentColor: newProduct.accentColor || '#6366f1'
  };

  db.products.unshift(newProdRecord);
  await writeDB(db);
  res.status(201).json(newProdRecord);
});

// PUT /api/products/:id - Edit an existing product (Admin)
app.put('/api/products/:id', async (req, res) => {
  const db = await readDB();
  const productIndex = db.products.findIndex(p => p.id === req.params.id);

  if (productIndex > -1) {
    const updatedRecord = {
      ...db.products[productIndex],
      ...req.body,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock || 0, 10)
    };
    db.products[productIndex] = updatedRecord;
    await writeDB(db);
    res.json(updatedRecord);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// DELETE /api/products/:id - Delete a product (Admin)
app.delete('/api/products/:id', async (req, res) => {
  const db = await readDB();
  const initialCount = db.products.length;
  db.products = db.products.filter(p => p.id !== req.params.id);

  if (db.products.length < initialCount) {
    await writeDB(db);
    res.json({ success: true, message: 'Product deleted' });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});


// ================= ORDER ROUTE HANDLERS =================

// GET /api/orders - Get all orders (Admin)
app.get('/api/orders', async (req, res) => {
  const db = await readDB();
  res.json(db.orders);
});

// GET /api/orders/:id - Get a single order details (Tracking)
app.get('/api/orders/:id', async (req, res) => {
  const db = await readDB();
  // Match either order ID (e.g. ORD-123456) or phone/mobile number
  const param = req.params.id.trim().toUpperCase();
  
  const order = db.orders.find(o => 
    o.id.toUpperCase() === param || 
    o.shippingDetails.phone.replace(/[\s+-]/g, '').endsWith(param.replace(/[\s+-]/g, ''))
  );

  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ error: 'Order not found matching ID or Mobile number' });
  }
});

// POST /api/orders - Create a new order (Customer Checkout)
app.post('/api/orders', async (req, res) => {
  const db = await readDB();
  const orderData = req.body;

  if (!orderData.items || orderData.items.length === 0) {
    return res.status(400).json({ error: 'Shopping bag items are required' });
  }

  // Create new order instance
  const newOrder = {
    id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
    date: new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    items: orderData.items,
    shippingDetails: orderData.shippingDetails,
    subtotal: parseFloat(orderData.subtotal),
    shipping: parseFloat(orderData.shipping),
    discount: parseFloat(orderData.discount || 0),
    total: parseFloat(orderData.total),
    couponApplied: orderData.couponApplied || null,
    status: 'Pending' // Initial state
  };

  // Decrement stocks in catalog database
  db.products = db.products.map(prod => {
    const orderedItem = orderData.items.filter(item => item.product.id === prod.id);
    if (orderedItem.length > 0) {
      const totalQuantity = orderedItem.reduce((sum, item) => sum + item.quantity, 0);
      return { ...prod, stock: Math.max(0, prod.stock - totalQuantity) };
    }
    return prod;
  });

  db.orders.unshift(newOrder);
  await writeDB(db);
  res.status(201).json(newOrder);
});

// PUT /api/orders/:id/status - Update order status (Admin dispatch board)
app.put('/api/orders/:id/status', async (req, res) => {
  const db = await readDB();
  const orderIndex = db.orders.findIndex(o => o.id === req.params.id);

  if (orderIndex > -1) {
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    db.orders[orderIndex].status = status;
    await writeDB(db);
    res.json(db.orders[orderIndex]);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});


// ================= ADMIN ROUTE HANDLERS =================

// POST /api/admin/login - Authenticate admin credentials
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@styleauraindia.com' && password === 'admin123') {
    res.json({ success: true, token: 'styleaura-admin-session-token' });
  } else {
    res.status(401).json({ error: 'Invalid admin credentials' });
  }
});

// ================= HTML TABLE VIEWER ROUTES (PASSWORD-PROTECTED) =================

function getAdminCookie(req) {
  const value = `; ${req.headers.cookie}`;
  const parts = value.split(`; admin_session=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function requireAuth(req, res, next) {
  const session = getAdminCookie(req);
  if (session === 'styleaura-admin-session-token') {
    return next();
  }
  
  // Render login page
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Backend Console Authorization | StyleAura India</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Outfit', sans-serif;
          background-color: #f8fafc;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
        }
        .login-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 2.5rem;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
          text-align: center;
        }
        .icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        h1 {
          font-size: 1.5rem;
          margin: 0 0 0.5rem 0;
          color: #1e1b4b;
          font-weight: 800;
        }
        p {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0 0 1.75rem 0;
          line-height: 1.5;
        }
        input {
          width: 100%;
          box-sizing: border-box;
          padding: 0.75rem 1rem;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          outline: none;
          transition: border-color 0.15s;
        }
        input:focus {
          border-color: #8b5cf6;
        }
        button {
          width: 100%;
          padding: 0.75rem;
          background: #8b5cf6;
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
        }
        button:hover {
          background: #7c3aed;
        }
      </style>
    </head>
    <body>
      <div class="login-card">
        <div class="icon">🔒</div>
        <h1>Console Authorization</h1>
        <p>Accessing the StyleAura India analytics ledger requires system credentials.</p>
        <form action="/backend-dashboard/login" method="POST">
          <input type="password" name="password" placeholder="Enter System Password" required autofocus />
          <button type="submit">Unlock Console</button>
        </form>
      </div>
    </body>
    </html>
  `);
}

// POST /backend-dashboard/login
app.post('/backend-dashboard/login', (req, res) => {
  const { password } = req.body;
  if (password === 'admin123') {
    res.setHeader('Set-Cookie', 'admin_session=styleaura-admin-session-token; Path=/; HttpOnly; Max-Age=3600');
    return res.redirect('/backend-dashboard');
  } else {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Backend Console Authorization | StyleAura India</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Outfit', sans-serif;
            background-color: #f8fafc;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
          }
          .login-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 24px;
            padding: 2.5rem;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            text-align: center;
          }
          .icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
          }
          h1 {
            font-size: 1.5rem;
            margin: 0 0 0.5rem 0;
            color: #1e1b4b;
            font-weight: 800;
          }
          p {
            font-size: 0.85rem;
            color: #64748b;
            margin: 0 0 1.75rem 0;
            line-height: 1.5;
          }
          input {
            width: 100%;
            box-sizing: border-box;
            padding: 0.75rem 1rem;
            border: 1px solid #dc2626;
            border-radius: 12px;
            font-size: 0.875rem;
            margin-bottom: 1rem;
            outline: none;
          }
          button {
            width: 100%;
            padding: 0.75rem;
            background: #8b5cf6;
            color: #ffffff;
            border: none;
            border-radius: 12px;
            font-size: 0.875rem;
            font-weight: 700;
            cursor: pointer;
            transition: background 0.2s;
          }
          button:hover {
            background: #7c3aed;
          }
          .error-msg {
            color: #dc2626;
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
          }
        </style>
      </head>
      <body>
        <div class="login-card">
          <div class="icon">❌</div>
          <h1>Console Authorization</h1>
          <p>Accessing the StyleAura India analytics ledger requires system credentials.</p>
          <div class="error-msg">Invalid password. Please try again.</div>
          <form action="/backend-dashboard/login" method="POST">
            <input type="password" name="password" placeholder="Enter System Password" required autofocus />
            <button type="submit">Unlock Console</button>
          </form>
        </div>
      </body>
      </html>
    `);
  }
});

// GET /backend-dashboard/logout
app.get('/backend-dashboard/logout', (req, res) => {
  res.setHeader('Set-Cookie', 'admin_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  return res.redirect('/backend-dashboard');
});

function renderPage(title, content, activeTab) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} | StyleAura India</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
      <style>
        :root {
          --primary: #8b5cf6;
          --primary-hover: #7c3aed;
          --bg: #f8fafc;
          --card: #ffffff;
          --text: #0f172a;
          --text-muted: #64748b;
          --border: #e2e8f0;
        }
        body {
          font-family: 'Outfit', sans-serif;
          background-color: var(--bg);
          color: var(--text);
          margin: 0;
          padding: 2rem 1.5rem;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        h1 {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 2.25rem;
          font-weight: 800;
          color: #1e1b4b;
          margin: 0 0 0.5rem 0;
        }
        .subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
          font-weight: 505;
        }
        .card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
          overflow-x: auto;
          margin-bottom: 1.5rem;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.85rem;
        }
        th {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: #1e1b4b;
          color: #ffffff;
          padding: 1rem;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }
        th:first-child {
          border-top-left-radius: 10px;
          border-bottom-left-radius: 10px;
        }
        th:last-child {
          border-top-right-radius: 10px;
          border-bottom-right-radius: 10px;
        }
        td {
          padding: 1rem;
          border-bottom: 1px solid var(--border);
          font-weight: 500;
        }
        tr:hover td {
          background-color: #f1f5f9;
        }
        tr:last-child td {
          border-bottom: none;
        }
        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .nav-links {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }
        .nav-btn {
          display: inline-block;
          padding: 0.6rem 1.25rem;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 12px;
          color: #1e1b4b;
          text-decoration: none;
          font-size: 0.825rem;
          font-weight: 700;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
        }
        .nav-btn:hover {
          background: var(--primary);
          color: #ffffff;
          border-color: var(--primary);
          transform: translateY(-1px);
        }
        .nav-btn.active {
          background: #1e1b4b;
          color: #ffffff;
          border-color: #1e1b4b;
        }
        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.6rem;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status-pending { background-color: #fef3c7; color: #b45309; }
        .status-processing { background-color: #e0e7ff; color: #4338ca; }
        .status-shipped { background-color: #dbeafe; color: #1d4ed8; }
        .status-delivered { background-color: #d1fae5; color: #047857; }
        .status-cancelled { background-color: #fee2e2; color: #b91c1c; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>StyleAura India Backend Data Viewer</h1>
          <p class="subtitle">Surat Studio Supply Chain Management &amp; Analytics API Console</p>
          <div class="nav-links">
            <a href="/" class="nav-btn">Customer Storefront</a>
            <a href="/admin" class="nav-btn">Admin Portal</a>
            <a href="/backend-dashboard?tab=products" class="nav-btn ${activeTab === 'products' ? 'active' : ''}">Products Table</a>
            <a href="/backend-dashboard?tab=orders" class="nav-btn ${activeTab === 'orders' ? 'active' : ''}">Orders Table</a>
            <a href="/backend-dashboard?tab=customers" class="nav-btn ${activeTab === 'customers' ? 'active' : ''}">Customers Table</a>
            <a href="/backend-dashboard/logout" class="nav-btn" style="border-color: #fca5a5; color: #dc2626;">Logout Console</a>
          </div>
        </div>
        ${content}
      </div>
    </body>
    </html>
  `;
}

// GET /backend-dashboard - Render password-protected table consoles
app.get('/backend-dashboard', requireAuth, async (req, res) => {
  const db = await readDB();
  const activeTab = req.query.tab || 'products';
  
  let productsRow = '';
  db.products.forEach(p => {
    const salePrice = p.category === 'Sale' ? p.price : p.price * 0.9;
    productsRow += `
      <tr>
        <td><strong style="color: var(--text-muted); font-family: monospace;">${p.id}</strong></td>
        <td><strong>${p.name}</strong></td>
        <td><span style="background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.25rem 0.5rem; font-size: 10px; font-weight: 700; text-transform: uppercase;">${p.category}</span></td>
        <td><strong>₹${p.price.toLocaleString('en-IN')}</strong></td>
        <td><strong style="color: #059669;">₹${salePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></td>
        <td><span style="font-weight: 700; color: ${p.stock <= 5 ? '#dc2626' : 'inherit'}">${p.stock} units</span></td>
        <td><strong style="color: #d97706;">★ ${p.rating}</strong> <span style="color: var(--text-muted); font-size: 11px;">(${p.reviewsCount})</span></td>
      </tr>
    `;
  });

  let ordersRow = '';
  db.orders.forEach(o => {
    const statusClass = `status-${o.status.toLowerCase()}`;
    const paymentMethod = o.shippingDetails.paymentMethod || 'UPI Payment (Mock)';
    ordersRow += `
      <tr>
        <td><strong style="color: var(--primary); font-family: monospace;">${o.id}</strong></td>
        <td><strong>${o.shippingDetails.fullName}</strong></td>
        <td style="color: var(--text-muted); font-weight: 600;">${o.shippingDetails.phone}</td>
        <td><strong>${o.shippingDetails.city}</strong></td>
        <td>${o.shippingDetails.state}</td>
        <td><strong style="color: #1e1b4b;">₹${o.total.toLocaleString('en-IN')}</strong></td>
        <td style="font-size: 11px; font-weight: 600; color: #475569;">${paymentMethod}</td>
        <td><span class="status-badge ${statusClass}">${o.status}</span></td>
        <td style="color: var(--text-muted); font-size: 11px;">${o.date}</td>
      </tr>
    `;
  });

  const uniqueCustomers = [];
  db.orders.forEach(o => {
    const phone = o.shippingDetails.phone;
    const exists = uniqueCustomers.find(c => c.phone === phone);
    if (!exists) {
      uniqueCustomers.push({
        name: o.shippingDetails.fullName,
        email: o.shippingDetails.email || 'N/A',
        phone: phone,
        address: o.shippingDetails.address || 'N/A',
        city: o.shippingDetails.city,
        state: o.shippingDetails.state,
        postcode: o.shippingDetails.postcode || 'N/A',
        totalOrders: 1
      });
    } else {
      exists.totalOrders += 1;
    }
  });

  let customersRow = '';
  uniqueCustomers.forEach(c => {
    customersRow += `
      <tr>
        <td><strong>${c.name}</strong></td>
        <td style="color: var(--text-muted); font-size: 12px;">${c.email}</td>
        <td style="color: var(--text-muted); font-weight: 600;">${c.phone}</td>
        <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.address}</td>
        <td><strong>${c.city}</strong></td>
        <td>${c.state}</td>
        <td><strong style="color: var(--text-muted);">${c.postcode}</strong></td>
        <td style="text-align: center;"><strong>${c.totalOrders}</strong></td>
      </tr>
    `;
  });

  let tableContent = '';
  if (activeTab === 'products') {
    tableContent = `
      <div class="card">
        <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.25rem; font-weight: 800; color: #1e1b4b; margin: 0 0 1rem 0;">Products Inventory Database</h2>
        <table>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Sale Price</th>
              <th>Stock</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            ${productsRow || '<tr><td colspan="7" style="text-align:center; color: var(--text-muted);">No products registered.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } else if (activeTab === 'orders') {
    tableContent = `
      <div class="card">
        <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.25rem; font-weight: 800; color: #1e1b4b; margin: 0 0 1rem 0;">Customer Dispatch Orders List</h2>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Mobile Number</th>
              <th>City</th>
              <th>State</th>
              <th>Total Amount</th>
              <th>Payment Method</th>
              <th>Order Status</th>
              <th>Created Date</th>
            </tr>
          </thead>
          <tbody>
            ${ordersRow || '<tr><td colspan="9" style="text-align:center; color: var(--text-muted);">No orders placed yet.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  } else if (activeTab === 'customers') {
    tableContent = `
      <div class="card">
        <h2 style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.25rem; font-weight: 800; color: #1e1b4b; margin: 0 0 1rem 0;">Unique Customer Accounts Registry</h2>
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Mobile Number</th>
              <th>Address</th>
              <th>City</th>
              <th>State</th>
              <th>PIN Code</th>
              <th style="text-align: center;">Total Orders</th>
            </tr>
          </thead>
          <tbody>
            ${customersRow || '<tr><td colspan="8" style="text-align:center; color: var(--text-muted);">No customer profiles found.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  }

  res.send(renderPage('Dashboard Console', tableContent, activeTab));
});

// Legacy table links redirects (requires authentication)
app.get('/products-table', requireAuth, (req, res) => res.redirect('/backend-dashboard?tab=products'));
app.get('/orders-table', requireAuth, (req, res) => res.redirect('/backend-dashboard?tab=orders'));
app.get('/customers-table', requireAuth, (req, res) => res.redirect('/backend-dashboard?tab=customers'));


// ================= STATIC WEBSITES & ROUTING Fallbacks =================

// 1. Serve Admin React + Vite build static files
app.use('/admin', express.static(path.join(__dirname, '../admin/dist')));

// Admin client-side routing fallback
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/dist/index.html'));
});
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin/dist/index.html'));
});

// 2. Serve Customer React + Vite build static files
app.use(express.static(path.join(__dirname, '../customer/dist')));

// Customer client-side routing fallback (catch-all)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../customer/dist/index.html'));
});

// Launch server listen
const serverInstance = app.listen(PORT, () => {
  console.log(`StyleAura India server API running on http://www.styleauraindia.com/ (port ${PORT})`);
});

serverInstance.on('error', (err) => {
  console.error('SERVER BIND ERROR:', err);
  if (err.code === 'EACCES') {
    console.error(`Port ${PORT} requires elevated privileges (Run as Administrator).`);
  } else if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use by another process.`);
  }
  process.exit(1);
});

