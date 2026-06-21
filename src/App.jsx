import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  // Authentication State
  const [token, setToken] = useState(localStorage.getItem('auth_token') || null);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('auth_user') || 'null')
  );
  
  // Auth Form State
  const [authTab, setAuthTab] = useState('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '', role: 'customer' });
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  // App UI State
  const [activeTab, setActiveTab] = useState('menu'); // customer: 'menu', 'orders' | cashier: 'place-order', 'orders' | admin: 'dashboard', 'menu-editor', 'orders'
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState({ success: false, status: 'offline' });
  const [notification, setNotification] = useState(null);
  
  // Menu Item Editor State
  const [menuForm, setMenuForm] = useState({ id: '', name: '', category: 'Pizza', price: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Customer Shopping Cart State
  const [cart, setCart] = useState([]);

  // Check backend server status
  const checkStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/status`);
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      setStatus({ success: false, status: 'offline' });
    }
  };

  // Helper request function incorporating JWT Authorization header
  const apiRequest = async (method, path, body = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });
    
    if (response.status === 401) {
      // Token expired or invalid, logout
      handleLogout();
      throw new Error('Session expired. Please sign in again.');
    }
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  };

  // Auth Operations
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthMessage('');
    
    if (!authForm.username || !authForm.password) {
      setAuthError('Please fill in all fields.');
      return;
    }

    try {
      if (authTab === 'login') {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: authForm.username, password: authForm.password })
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          setToken(data.token);
          setUser(data.cashier);
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('auth_user', JSON.stringify(data.cashier));
          
          // Set default view tab depending on role
          if (data.cashier.role === 'admin') setActiveTab('dashboard');
          else if (data.cashier.role === 'cashier') setActiveTab('orders');
          else setActiveTab('menu');
          
          showToast(`Welcome back, ${data.cashier.username}!`);
        } else {
          setAuthError(data.message || 'Invalid username or password.');
        }
      } else {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(authForm)
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          setAuthMessage('Account created successfully! Please sign in.');
          setAuthTab('login');
          setAuthForm({ username: '', password: '', role: 'customer' });
        } else {
          setAuthError(data.message || 'Registration failed.');
        }
      }
    } catch (err) {
      setAuthError('Connection error. Is the server running?');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setCart([]);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  // Fetch Menu Items and Orders
  const fetchData = async () => {
    if (!token) return;
    try {
      const menuData = await apiRequest('GET', '/menu');
      setMenuItems(Array.isArray(menuData.data) ? menuData.data : []);
      
      const ordersData = await apiRequest('GET', '/orders');
      setOrders(Array.isArray(ordersData.data) ? ordersData.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchData();
  }, [token]);

  // Toast Notification
  const showToast = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Cart Operations
  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    showToast(`Added ${item.name} to cart!`);
  };

  const updateQuantity = (itemId, change) => {
    const existing = cart.find(c => c.id === itemId);
    if (!existing) return;
    
    const newQty = existing.quantity + change;
    if (newQty <= 0) {
      setCart(cart.filter(c => c.id !== itemId));
    } else {
      setCart(cart.map(c => c.id === itemId ? { ...c, quantity: newQty } : c));
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      // The backend placeOrder endpoint expects:
      // body: { category, items: [{ description, quantity, unitPrice }] }
      // Category is mandatory. Let's group all items under the category of the first item
      // or check how backend handles multiple items.
      const primaryCategory = cart[0].category || 'Pizza';
      const itemsPayload = cart.map(c => ({
        description: c.name,
        quantity: c.quantity,
        unitPrice: parseFloat(c.price)
      }));

      await apiRequest('POST', '/orders', {
        category: primaryCategory,
        items: itemsPayload
      });

      setCart([]);
      fetchData();
      showToast('Order placed successfully! 🛒');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Admin Menu Editor CRUD Operations
  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    if (!menuForm.name || !menuForm.price) return;
    
    try {
      const payload = {
        name: menuForm.name,
        category: menuForm.category,
        price: parseFloat(menuForm.price),
        description: menuForm.description
      };

      if (isEditing) {
        await apiRequest('PUT', `/menu/${menuForm.id}`, payload);
        showToast('Menu item updated successfully!');
      } else {
        await apiRequest('POST', '/menu', payload);
        showToast('Menu item added successfully!');
      }
      
      setMenuForm({ id: '', name: '', category: 'Pizza', price: '', description: '' });
      setIsEditing(false);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEditClick = (item) => {
    setMenuForm({
      id: item.id || item._id,
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description || ''
    });
    setIsEditing(true);
  };

  const handleDeleteClick = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await apiRequest('DELETE', `/menu/${itemId}`);
      showToast('Menu item deleted.');
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Helper static category details
  const categories = ['Pizza', 'Burger', 'Chips', 'Coke', 'Sprite', 'IceCream'];
  const categoryEmojis = {
    Pizza: '🍕', Burger: '🍔', Chips: '🍟', Coke: '🥤', Sprite: '🥤', IceCream: '🍦'
  };

  // Filtered Menu Items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate Cart Totals
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const serviceFee = cartSubtotal > 0 ? 15.00 : 0;
  const cartTotal = cartSubtotal + serviceFee;

  // Render Login/Register view if not logged in
  if (!token) {
    return (
      <div className="auth-container">
        <div className="card auth-card">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '3rem' }}>🍕</span>
            <h1 style={{ fontSize: '2.2rem', marginTop: '10px' }}>Fas_Food App</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
              Multi-Role Food Modernization Portal
            </p>
          </div>

          <div className="auth-tabs">
            <button 
              className={`auth-tab ${authTab === 'login' ? 'active' : ''}`}
              onClick={() => { setAuthTab('login'); setAuthError(''); }}
            >
              Sign In
            </button>
            <button 
              className={`auth-tab ${authTab === 'register' ? 'active' : ''}`}
              onClick={() => { setAuthTab('register'); setAuthError(''); }}
            >
              Sign Up
            </button>
          </div>

          {authError && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.15)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              color: '#f87171', 
              borderRadius: '12px', 
              padding: '12px', 
              marginBottom: '16px',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}>
              {authError}
            </div>
          )}

          {authMessage && (
            <div style={{ 
              background: 'rgba(16, 185, 129, 0.15)', 
              border: '1px solid rgba(16, 185, 129, 0.3)', 
              color: '#34d399', 
              borderRadius: '12px', 
              padding: '12px', 
              marginBottom: '16px',
              fontSize: '0.9rem',
              textAlign: 'center'
            }}>
              {authMessage}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="modern-form">
            <div className="form-group">
              <label>Username</label>
              <input 
                type="text" 
                placeholder="e.g. yaqoob"
                value={authForm.username}
                onChange={e => setAuthForm({ ...authForm, username: e.target.value })}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={authForm.password}
                onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                required
              />
            </div>

            {authTab === 'register' && (
              <div className="form-group">
                <label>Select Role</label>
                <select 
                  value={authForm.role}
                  onChange={e => setAuthForm({ ...authForm, role: e.target.value })}
                  style={{ width: '100%' }}
                >
                  <option value="customer">Customer (Order Meals)</option>
                  <option value="cashier">Cashier (Process Store Orders)</option>
                  <option value="admin">Admin (Manage Systems & Sales)</option>
                </select>
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ marginTop: '10px', width: '100%' }}>
              {authTab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render main application dashboard
  return (
    <div className="app-container">
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 1000,
          padding: '16px 24px', borderRadius: '16px',
          background: notification.type === 'success' ? '#10b981' : '#ef4444',
          color: '#fff', fontWeight: 600, fontSize: '0.95rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          animation: 'slideIn 0.3s ease'
        }}>
          {notification.text}
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div>
          <h1>🍕 Fas_Food App</h1>
          <p className="subtitle" style={{ fontSize: '0.9rem', marginTop: '4px' }}>
            Vercel Cloud Deploy Dashboard
            <span style={{
              display: 'inline-block',
              marginLeft: '12px',
              padding: '2px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: status.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: status.success ? '#34d399' : '#f87171',
              border: `1px solid ${status.success ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
            }}>
              {status.success ? '● System Live' : '● Offline Mode'}
            </span>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="user-badge">
            <span style={{ fontWeight: 600 }}>{user?.username}</span>
            <span className={`role-tag role-${user?.role || 'customer'}`}>
              {user?.role}
            </span>
          </div>
          <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Navigation tabs according to roles */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', justifyContent: 'center' }}>
        {user?.role === 'customer' && (
          <>
            <button 
              className={`btn ${activeTab === 'menu' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('menu')}
            >
              🍔 Food Menu
            </button>
            <button 
              className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('orders')}
            >
              📋 My Orders
            </button>
          </>
        )}

        {user?.role === 'cashier' && (
          <>
            <button 
              className={`btn ${activeTab === 'menu' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('menu')}
            >
              🍔 Menu Catalog
            </button>
            <button 
              className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('orders')}
            >
              📋 Order Queue
            </button>
          </>
        )}

        {user?.role === 'admin' && (
          <>
            <button 
              className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Sales Insights
            </button>
            <button 
              className={`btn ${activeTab === 'menu-editor' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('menu-editor')}
            >
              ✏️ Menu Management
            </button>
            <button 
              className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('orders')}
            >
              📋 Transaction Ledger
            </button>
          </>
        )}
      </div>

      {/* 1. CUSTOMER MENU VIEW */}
      {activeTab === 'menu' && (
        <div className="grid-container" style={{ gridTemplateColumns: user?.role === 'customer' ? '2.2fr 1fr' : '1fr' }}>
          <div>
            {/* Search & Category Filter */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '24px' }}>
              <input 
                type="text" 
                placeholder="Search pizzas, burgers, sprite..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ flexGrow: 1 }}
              />
            </div>

            <div className="category-bar">
              <button 
                className={`category-btn ${selectedCategory === 'All' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('All')}
              >
                🍽️ All Items
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {categoryEmojis[cat]} {cat}
                </button>
              ))}
            </div>

            {/* Menu Grid */}
            <div className="menu-grid">
              {filteredMenuItems.length === 0 ? (
                <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px' }}>
                  <span style={{ fontSize: '3rem' }}>🔍</span>
                  <h3 style={{ marginTop: '12px' }}>No items found</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>
                    Try checking other categories or verify your query
                  </p>
                </div>
              ) : (
                filteredMenuItems.map(item => (
                  <div key={item.id || item._id} className="card food-card">
                    <div className="food-card-img-placeholder">
                      {categoryEmojis[item.category] || '🍔'}
                    </div>
                    <div>
                      <div className="food-title">{item.name}</div>
                      <div className="food-desc">{item.description || 'Delicately cooked fresh fast-food item.'}</div>
                    </div>
                    <div className="food-footer">
                      <span className="food-price">R{parseFloat(item.price).toFixed(2)}</span>
                      {user?.role === 'customer' && (
                        <button onClick={() => addToCart(item)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Cart Section (Only visible for customers) */}
          {user?.role === 'customer' && (
            <div className="card cart-panel">
              <h2>🛒 Shopping Cart</h2>
              {cart.length === 0 ? (
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
                  <span style={{ fontSize: '3rem' }}>🛍️</span>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '10px' }}>
                    Your cart is empty
                  </p>
                </div>
              ) : (
                <>
                  <div className="cart-list">
                    {cart.map(item => (
                      <div key={item.id} className="cart-item">
                        <div className="cart-item-info">
                          <div className="cart-item-name">{item.name}</div>
                          <div className="cart-item-price">R{parseFloat(item.price).toFixed(2)}</div>
                        </div>
                        <div className="cart-item-controls">
                          <button onClick={() => updateQuantity(item.id, -1)} className="btn-secondary cart-qty-btn">-</button>
                          <span className="cart-qty">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="btn-secondary cart-qty-btn">+</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cart-totals">
                    <div className="total-row">
                      <span>Subtotal</span>
                      <span>R{cartSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="total-row">
                      <span>Service Fee</span>
                      <span>R{serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="total-row grand-total">
                      <span>Grand Total</span>
                      <span>R{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button onClick={handleCheckout} className="btn-success" style={{ width: '100%' }}>
                    🛒 Checkout order
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. ORDER QUEUE / HISTORY VIEW */}
      {activeTab === 'orders' && (
        <div className="card">
          <h2>📋 Order Ledger Queue ({orders.length})</h2>
          
          <div style={{ overflowX: 'auto', marginTop: '15px' }}>
            {orders.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
                No records found.
              </p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Category</th>
                    <th>Staff / Cashier</th>
                    <th>Items Purchased</th>
                    <th>Status</th>
                    <th>Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id || order._id}>
                      <td style={{ fontWeight: 600 }}>#{order.id || order._id ? (order.id || order._id).substring(0, 8) : '—'}</td>
                      <td>{order.category}</td>
                      <td>{order.cashier || '—'}</td>
                      <td>
                        {order.items && order.items.map((i, idx) => (
                          <div key={idx} style={{ fontSize: '0.9rem' }}>
                            {i.quantity}x {i.description}
                          </div>
                        ))}
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 12px', borderRadius: '12px',
                          fontSize: '0.8rem', fontWeight: 600,
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#34d399',
                          border: '1px solid rgba(16,185,129,0.2)'
                        }}>
                          Completed
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--secondary)' }}>
                        R{parseFloat(order.totalAmount || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 3. ADMIN SALES DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div>
          <div className="stats-grid">
            <div className="card stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-val" style={{ color: 'var(--secondary)' }}>
                R{orders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0).toFixed(2)}
              </div>
              <div className="stat-lbl">Total Gross Revenue</div>
            </div>
            
            <div className="card stat-card">
              <div className="stat-icon">🛒</div>
              <div className="stat-val" style={{ color: 'var(--success)' }}>
                {orders.length}
              </div>
              <div className="stat-lbl">Orders Processed</div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-val" style={{ color: '#6c5ce7' }}>
                {menuItems.length}
              </div>
              <div className="stat-lbl">Active Menu Items</div>
            </div>
          </div>

          <div className="grid-container">
            <div className="card">
              <h2>📊 Category Summary</h2>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '10px' }}>
                {categories.map(cat => {
                  const count = menuItems.filter(i => i.category === cat).length;
                  return (
                    <div key={cat} style={{
                      flex: '1 1 120px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '16px', padding: '16px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '1.8rem' }}>{categoryEmojis[cat]}</div>
                      <div style={{ fontWeight: 600, marginTop: '8px', fontSize: '0.95rem' }}>{cat}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {count} item{count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card">
              <h2>📋 Recent Sales ledger</h2>
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {orders.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No sales recorded yet.</p>
                ) : (
                  <ul style={{ gap: '8px' }}>
                    {orders.slice(0, 5).map((order, idx) => (
                      <li key={idx} style={{ padding: '10px 14px' }}>
                        <div>
                          <strong>{order.category} Order</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>by {order.cashier || 'customer'}</div>
                        </div>
                        <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>
                          R{parseFloat(order.totalAmount || 0).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ADMIN MENU MANAGEMENT CRUD VIEW */}
      {activeTab === 'menu-editor' && (
        <div className="grid-container">
          <div className="card">
            <h2>{isEditing ? '✏️ Edit Menu Item' : '➕ Add Menu Item'}</h2>
            <form onSubmit={handleMenuSubmit} className="modern-form">
              <div className="form-group">
                <label>Item Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Pepperoni Feast"
                  value={menuForm.name}
                  onChange={e => setMenuForm({ ...menuForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select 
                  value={menuForm.category}
                  onChange={e => setMenuForm({ ...menuForm, category: e.target.value })}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{categoryEmojis[cat]} {cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Price (ZAR / R)</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="e.g. 119.90"
                  value={menuForm.price}
                  onChange={e => setMenuForm({ ...menuForm, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  rows="3"
                  placeholder="Describe ingredients..."
                  value={menuForm.description}
                  onChange={e => setMenuForm({ ...menuForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flexGrow: 1 }}>
                  {isEditing ? 'Update Item' : 'Add to Menu'}
                </button>
                {isEditing && (
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => {
                      setIsEditing(false);
                      setMenuForm({ id: '', name: '', category: 'Pizza', price: '', description: '' });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="card">
            <h2>📜 Current Menu Items ({menuItems.length})</h2>
            <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '5px' }}>
              {menuItems.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
                  No items in the menu catalog.
                </p>
              ) : (
                <ul style={{ gap: '12px' }}>
                  {menuItems.map(item => (
                    <li key={item.id || item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flexGrow: 1 }}>
                        <span style={{ fontSize: '1.1rem' }}>{categoryEmojis[item.category]} </span>
                        <strong>{item.name}</strong>
                        <span style={{ color: 'var(--secondary)', marginLeft: '12px', fontWeight: 600 }}>R{parseFloat(item.price).toFixed(2)}</span>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {item.category} {item.description ? `• ${item.description}` : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          onClick={() => handleEditClick(item)} 
                          className="btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(item.id || item._id)} 
                          className="btn-danger" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;