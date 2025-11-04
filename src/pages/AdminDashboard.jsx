// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Chart from 'chart.js/auto';

// Utility functions for localStorage
const USERS_KEY     = 'mh_users';
const PRODUCTS_KEY  = 'mh_products';
const ORDERS_KEY    = 'mh_orders';
const CURR_KEY      = 'mh_currentUser';

const getProducts = () => JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
const saveProducts = (a) => localStorage.setItem(PRODUCTS_KEY, JSON.stringify(a));
const getOrders   = () => JSON.parse(localStorage.getItem(ORDERS_KEY)   || '[]');
const saveOrders   = (a) => localStorage.setItem(ORDERS_KEY,   JSON.stringify(a));
const getUsers    = () => JSON.parse(localStorage.getItem(USERS_KEY)    || '[]');
const saveUsers    = (a) => localStorage.setItem(USERS_KEY,    JSON.stringify(a));

const AdminDashboard = () => {
  const [view, setView]        = useState('dashboard');
  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    console.log('AdminDashboard mount. currentUser raw:', localStorage.getItem(CURR_KEY));
    const current = localStorage.getItem(CURR_KEY);
    if (!current) {
      window.location.href = '/admin/login';
      return;
    }
    const user = JSON.parse(current);
    if (user.role !== 'admin') {
      window.location.href = '/admin/login';
      return;
    }
    setCurrentUser(user);
    renderAll();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [modalData, setModalData]     = useState({});

  const [salesChartRef, setSalesChartRef]   = useState(null);
  const [statusChartRef, setStatusChartRef] = useState(null);
  const [miniChartRef, setMiniChartRef]     = useState(null);

  const switchView = (newView) => {
    setView(newView);
    if (newView === 'products') renderProducts();
    if (newView === 'orders')   renderOrders();
    if (newView === 'users')    renderUsers();
    if (newView === 'analytics')renderAnalytics();
  };

  const computeStats = useCallback(() => {
    const products = getProducts();
    const orders   = getOrders();
    const users    = getUsers();

    const revenue = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);

    const statRevenueEl = document.getElementById('statRevenue');
    if (statRevenueEl) statRevenueEl.textContent = `$${revenue.toFixed(2)}`;

    const statProductsEl = document.getElementById('statProducts');
    if (statProductsEl) statProductsEl.textContent = products.length;

    const statOrdersEl = document.getElementById('statOrders');
    if (statOrdersEl) statOrdersEl.textContent = orders.length;

    const statUsersEl = document.getElementById('statUsers');
    if (statUsersEl) statUsersEl.textContent = users.length;

    const tbody  = document.querySelector('#recentOrdersTable tbody');
    if (tbody) {
      tbody.innerHTML = '';
      orders
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6)
        .forEach((o) => {
          const user = users.find((u) => u.id === o.userId) || { name: 'Guest' };
          const tr   = document.createElement('tr');
          tr.innerHTML = `<td>${o.id}</td><td>${user.name}</td><td>${o.status}</td><td>$${o.total.toFixed(2)}</td>`;
          tbody.appendChild(tr);
        });
    } else {
      console.warn('Recent Orders tbody not found');
    }
  }, []);

  const renderProducts = useCallback(() => {
    const grid = document.getElementById('productsGrid');
    if (!grid) {
      console.warn('Products grid element not found');
      return;
    }
    grid.innerHTML = '';
    const users    = getUsers();
    const products = getProducts();

    products.forEach((p) => {
      const seller = users.find((u) => u.id === p.sellerId) || { name: 'System/N/A' };
      const card   = document.createElement('div');
      card.className = 'product';
      card.innerHTML = `
        <img src="${p.imageUrl || 'placeholder.jpg'}" alt="${p.name}">
        <div style="font-weight:700">${p.name}</div>
        <div style="color:var(--muted);font-size:13px">${seller.name} | ${p.stock} in stock</div>
        <div style="margin-top:auto;display:flex;gap:8px;align-items:center">
          <div style="font-weight:800;font-size:16px">$${(p.price || 0).toFixed(2)}</div>
          <div class="right">
            <button class="action-btn" data-id="${p.id}">✏️</button>
            <button class="action-btn" data-delete="${p.id}">🗑️</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
      const editBtn   = card.querySelector(`button[data-id="${p.id}"]`);
      const deleteBtn = card.querySelector(`button[data-delete="${p.id}"]`);
      if (editBtn)   editBtn.addEventListener('click',   () => editProduct(p.id));
      if (deleteBtn) deleteBtn.addEventListener('click', () => deleteProduct(p.id));
    });
  }, []);

  const editProduct = (id) => {
    const p = getProducts().find((x) => x.id === id);
    if (p) openProductModal(p);
  };

  const deleteProduct = (id) => {
    if (!confirm('Delete this product?')) return;
    const arr = getProducts().filter((p) => p.id !== id);
    saveProducts(arr);
    renderProducts();
    computeStats();
    alert('Deleted');
  };

  const renderOrders = useCallback(() => {
    const tbody = document.querySelector('#ordersTable tbody');
    if (!tbody) {
      console.warn('Orders table tbody not found');
      return;
    }
    tbody.innerHTML = '';
    const orders = getOrders().slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const users  = getUsers();

    orders.forEach((o) => {
      const user  = users.find((u) => u.id === o.userId) || { name: 'Guest' };
      const items = (o.products || []).map((i) => `${i.name}×${i.quantity}`).join(', ');
      const tr    = document.createElement('tr');
      tr.innerHTML = `
        <td>${o.id}</td><td>${user.name}</td><td>${items}</td><td>$${(o.total || 0).toFixed(2)}</td>
        <td>
          <select data-id="${o.id}" class="statusSelect">
            <option ${o.status === 'Pending'    ? 'selected' : ''}>Pending</option>
            <option ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
            <option ${o.status === 'Shipped'    ? 'selected' : ''}>Shipped</option>
            <option ${o.status === 'Delivered'  ? 'selected' : ''}>Delivered</option>
            <option ${o.status === 'Returned'   ? 'selected' : ''}>Returned</option>
            <option ${o.status === 'Refunded'   ? 'selected' : ''}>Refunded</option>
          </select>
        </td>
        <td>
          <button class="action-btn" data-refund="${o.id}">Refund</button>
        </td>`;
      tbody.appendChild(tr);
    });

    document.querySelectorAll('.statusSelect').forEach((s) => {
      s.addEventListener('change', (e) => {
        const id  = e.target.dataset.id;
        const val = e.target.value;
        const orders = getOrders().map((o) => (o.id === id ? { ...o, status: val } : o));
        saveOrders(orders);
        computeStats();
        renderOrders();
      });
    });

    document.querySelectorAll('button[data-refund]').forEach((b) => {
      b.addEventListener('click', (e) => {
        const id = e.target.dataset.refund;
        if (!confirm('Process refund for this order?')) return;
        const orders = getOrders().map((o) => (o.id === id ? { ...o, status: 'Refunded', refunded: true } : o));
        saveOrders(orders);
        computeStats();
        renderOrders();
        alert('Refund processed');
      });
    });
  }, []);

  const approveSeller = (sellerId) => {
    if (!confirm('Are you sure you want to approve this seller?')) return;
    let users = getUsers();
    users = users.map((u) => (u.id === sellerId ? { ...u, status: 'approved' } : u));
    saveUsers(users);
    renderUsers();
    alert('Seller approved! They can now log in and manage products.');
    computeStats();
  };

  const renderUsers = useCallback(() => {
    const tbody = document.querySelector('#usersTable tbody');
    if (!tbody) {
      console.warn('Users table tbody not found');
      return;
    }
    tbody.innerHTML = '';
    const users  = getUsers();
    const orders = getOrders();

    users.forEach((u) => {
      const count = orders.filter((o) => o.userId === u.id).length;
      const tr    = document.createElement('tr');

      let actionBtn  = '';
      let roleDisplay = u.role;

      if (u.role === 'seller') {
        if (u.status === 'pending') {
          roleDisplay = '<span class="tag badge-red">Pending Seller</span>';
          actionBtn  = `<button class="action-btn btn-primary" data-approve="${u.id}">Approve</button>`;
        } else if (u.status === 'approved') {
          roleDisplay = '<span class="tag badge-green">Approved Seller</span>';
        }
      }

      tr.innerHTML = `
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${roleDisplay}</td>
        <td>${new Date(u.createdAt).toLocaleDateString()}</td>
        <td>${count}</td>
        <td>${actionBtn}</td>
      `;
      tbody.appendChild(tr);

      const approveBtn = tr.querySelector(`button[data-approve="${u.id}"]`);
      if (approveBtn) approveBtn.addEventListener('click', () => approveSeller(u.id));
    });
  }, []);

  const renderAnalytics = useCallback(() => {
    const orders   = getOrders();

    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    const salesByDay = days.map((day) =>
      orders.filter((o) => o.createdAt.slice(0, 10) === day)
            .reduce((s, o) => s + (o.total || 0), 0)
    );

    const ctx = document.getElementById('salesChart')?.getContext('2d');
    if (ctx) {
      if (salesChartRef) salesChartRef.destroy();
      const newChart = new Chart(ctx, {
        type: 'line',
        data: { labels: days.map((d) => d.slice(5)), datasets: [{ label: 'Sales', data: salesByDay, fill: true, tension: 0.3, borderWidth: 2 }] },
        options: { plugins: { legend: { display: false } } },
      });
      setSalesChartRef(newChart);
    } else {
      console.warn('Sales chart canvas not found');
    }

    const statusCounts = {};
    orders.forEach((o) => (statusCounts[o.status] = (statusCounts[o.status] || 0) + 1));
    const stLabels   = Object.keys(statusCounts);
    const stData     = stLabels.map((k) => statusCounts[k]);
    const ctx2       = document.getElementById('statusChart')?.getContext('2d');
    if (ctx2) {
      if (statusChartRef) statusChartRef.destroy();
      const newChart2 = new Chart(ctx2, {
        type: 'doughnut',
        data: { labels: stLabels, datasets: [{ data: stData }] },
        options: { plugins: { legend: { position: 'right' } } },
      });
      setStatusChartRef(newChart2);
    } else {
      console.warn('Status chart canvas not found');
    }
  }, [salesChartRef, statusChartRef]);

  const renderTopProducts = useCallback(() => {
    const products = getProducts();
    const orders   = getOrders();
    const map      = {};
    orders.forEach((o) => {
      (o.products || []).forEach((i) => {
        map[i.productId] = (map[i.productId] || 0) + (i.quantity || 1);
      });
    });
    const arr = Object.entries(map)
      .map(([pid, qty]) => {
        const p = products.find((x) => x.id === pid);
        return { id: pid, name: p ? p.name : pid, qty };
      })
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const el = document.getElementById('topProducts');
    if (el) {
      el.innerHTML = '';
      arr.forEach((item) => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.padding = '6px 0';
        row.innerHTML = `<div style="font-weight:700">${item.name}</div><div style="color:var(--muted)">${item.qty} sold</div>`;
        el.appendChild(row);
      });
    } else {
      console.warn('Top products element not found');
    }

    const ctx = document.getElementById('miniSales')?.getContext('2d');
    if (ctx) {
      if (miniChartRef) miniChartRef.destroy();
      const newChart = new Chart(ctx, {
        type: 'bar',
        data: { labels: arr.map((a) => a.name), datasets: [{ label: 'Sold', data: arr.map((a) => a.qty), barThickness: 18 }] },
        options: { plugins: { legend: { display: false } }, scales: { x: { ticks: { autoSkip: false } } } },
      });
      setMiniChartRef(newChart);
    } else {
      console.warn('Mini sales chart canvas not found');
    }
  }, [miniChartRef]);

  const renderAll = () => {
    computeStats();
    renderProducts();
    renderOrders();
    renderUsers();
    renderAnalytics();
    renderTopProducts();
  };

  const refreshProducts = () => renderProducts();

  const clearData = () => {
    if (!confirm('Clear demo data (products, orders, users)? This will reset seeded demo data.')) return;
    localStorage.removeItem(PRODUCTS_KEY);
    localStorage.removeItem(ORDERS_KEY);
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(CURR_KEY);
    alert('Cleared. The app will reset to demo state.');
    location.reload();
  };

  const openProductModal = (p) => {
    setEditingId(p ? p.id : null);
    setModalData(p || { name: '', price: '', category: '', stock: 10, imageUrl: '', description: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const saveProduct = () => {
    const { name, price, category, stock, imageUrl, description } = modalData;
    if (!name) {
      alert('Enter name');
      return;
    }
    let products = getProducts();
    if (editingId) {
      products = products.map((p) =>
        p.id === editingId ? { ...p, name, price: parseFloat(price), category, stock: parseInt(stock), imageUrl, description } : p
      );
    } else {
      const id       = 'p_' + Math.random().toString(36).slice(2, 9);
      const usersArr = getUsers();
      const sellerId = usersArr.find((u) => u.role === 'seller' && u.status === 'approved')?.id || 'u_admin_1';
      products.push({ id, name, price: parseFloat(price), category, stock: parseInt(stock), imageUrl, description, sellerId });
    }
    saveProducts(products);
    closeModal();
    renderAll();
  };

  const logout = () => {
    localStorage.removeItem(CURR_KEY);
    window.location.href = '/admin/login';
  };

  if (!currentUser.name) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        Loading Admin Session...
      </div>
    );
  }

  return (
    <>
      <div className="container header">
        <div className="brand">
          <div className="logo">MH</div>
          <div>
            <div style={{ fontWeight: 800, color: '#024b6b' }}>MarketHub Admin</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Manage products, orders & users</div>
          </div>
        </div>
        <div className="nav">
          <div style={{ color: 'var(--muted)' }}>Hello, {currentUser.name.split(' ')[0]}</div>
          <button className="btn btn-outline" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="container app">
        <aside className="sidebar">
          <div className="side-brand">
            <div className="logo" style={{ width: '44px', height: '44px' }}>AD</div>
            <div>
              <div style={{ fontWeight: 800 }}>Admin Panel</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>MarketHub</div>
            </div>
          </div>

          <div className="side-menu">
            <button className={view === 'dashboard'  ? 'active' : ''} onClick={() => switchView('dashboard')}>Dashboard</button>
            <button className={view === 'products'   ? 'active' : ''} onClick={() => switchView('products')}>Products</button>
            <button className={view === 'orders'     ? 'active' : ''} onClick={() => switchView('orders')}>Orders</button>
            <button className={view === 'users'      ? 'active' : ''} onClick={() => switchView('users')}>Users</button>
            <button className={view === 'analytics'  ? 'active' : ''} onClick={() => switchView('analytics')}>Analytics</button>
            <button className={view === 'settings'   ? 'active' : ''} onClick={() => switchView('settings')}>Settings</button>
          </div>

          <div style={{ marginTop: '18px', color: 'var(--muted)', fontSize: '13px' }}>
            Signed in as: <strong>{currentUser.email}</strong>
          </div>
        </aside>

        <main className="main">
          {/* Dashboard View */}
          <div id="view-dashboard" className="view" style={{ display: view === 'dashboard' ? 'block' : 'none' }}>
            <div className="kpi">
              <div className="card kpi-item">
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Total Revenue</div>
                <div style={{ fontSize: '20px', fontWeight: 800 }} id="statRevenue">$0</div>
              </div>
              <div className="card kpi-item">
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Products</div>
                <div style={{ fontSize: '20px', fontWeight: 800 }} id="statProducts">0</div>
              </div>
              <div className="card kpi-item">
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Orders</div>
                <div style={{ fontSize: '20px', fontWeight: 800 }} id="statOrders">0</div>
              </div>
              <div className="card kpi-item">
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Users</div>
                <div style={{ fontSize: '20px', fontWeight: 800 }} id="statUsers">0</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '18px', marginTop: '18px', alignItems: 'start' }}>
              <div className="card">
                <h3 style={{ marginBottom: '8px' }}>Recent Orders</h3>
                <table className="table" id="recentOrdersTable">
                  <thead><tr><th>Order</th><th>User</th><th>Status</th><th>Total</th></tr></thead>
                  <tbody></tbody>
                </table>
              </div>

              <div className="card">
                <h3 style={{ marginBottom: '8px' }}>Top Products</h3>
                <div id="topProducts"></div>
                <canvas id="miniSales" height="180"></canvas>
              </div>
            </div>
          </div>

          {/* Products View */}
          <div id="view-products" className="view" style={{ display: view === 'products' ? 'block' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Products</h3>
              <div>
                <button className="btn btn-outline" onClick={refreshProducts}>Refresh</button>
                <button className="btn btn-primary" onClick={() => openProductModal()}>Add Product</button>
              </div>
            </div>
            <div className="product-grid" id="productsGrid" style={{ marginTop: '14px' }}></div>
          </div>

          {/* Orders View */}
          <div id="view-orders" className="view" style={{ display: view === 'orders' ? 'block' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Orders</h3>
              <div className="small" style={{ color: 'var(--muted)' }}>Manage order status & process refunds</div>
            </div>
            <table className="table" id="ordersTable">
              <thead><tr><th>Id</th><th>User</th><th>Items</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
              <tbody></tbody>
            </table>
          </div>

          {/* Users View */}
          <div id="view-users" className="view" style={{ display: view === 'users' ? 'block' : 'none' }}>
            <h3>Users</h3>
            <table className="table" id="usersTable">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Orders</th><th>Actions</th></tr></thead>
              <tbody></tbody>
            </table>
          </div>

          {/* Analytics View */}
          <div id="view-analytics" className="view" style={{ display: view === 'analytics' ? 'block' : 'none' }}>
            <h3>Analytics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
              <div className="card">
                <h4>Sales over time</h4>
                <canvas id="salesChart" height="220"></canvas>
              </div>
              <div className="card">
                <h4>Order status breakdown</h4>
                <canvas id="statusChart" height="220"></canvas>
              </div>
            </div>
          </div>

          {/* Settings View */}
          <div id="view-settings" className="view" style={{ display: view === 'settings' ? 'block' : 'none' }}>
            <h3>Settings</h3>
            <div className="card">
              <p className="small" style={{ color: 'var(--muted)' }}>
                This demo stores data in your browser localStorage. You may clear data from dev tools or use the button below.
              </p>
              <button className="btn btn-outline" onClick={clearData}>Clear demo data</button>
            </div>
          </div>

        </main>
      </div>

      {/* Product Modal */}
      <div className={`modal ${isModalOpen ? 'show' : ''}`} id="productModal">
        <div className="modal-card">
          <h3 id="modalTitle">{editingId ? 'Edit Product' : 'Add Product'}</h3>
          <div className="form-row">
            <input
              id="pname"
              className="input"
              placeholder="Product name"
              value={modalData.name || ''}
              onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
            />
            <input
              id="pprice"
              className="input"
              placeholder="Price"
              type="number"
              step="0.01"
              value={modalData.price || ''}
              onChange={(e) => setModalData({ ...modalData, price: e.target.value })}
            />
            <input
              id="pcategory"
              className="input"
              placeholder="Category"
              value={modalData.category || ''}
              onChange={(e) => setModalData({ ...modalData, category: e.target.value })}
            />
            <input
              id="pstock"
              className="input"
              placeholder="Stock"
              type="number"
              value={modalData.stock || ''}
              onChange={(e) => setModalData({ ...modalData, stock: e.target.value })}
            />
            <input
              id="pimg"
              className="input"
              placeholder="Image URL"
              value={modalData.imageUrl || ''}
              onChange={(e) => setModalData({ ...modalData, imageUrl: e.target.value })}
            />
            <textarea
              id="pdesc"
              className="input"
              placeholder="Short description"
              style={{ height: '90px' }}
              value={modalData.description || ''}
              onChange={(e) => setModalData({ ...modalData, description: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button className="btn btn-outline" onClick={closeModal}>Cancel</button>
            <button className="btn btn-primary" onClick={saveProduct}>Save</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
