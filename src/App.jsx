import React, { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ===========================
// FOOD DATA CONSTANTS
// ===========================
const CATEGORIES = ['Pizza', 'Burger', 'Chips', 'Coke', 'Sprite', 'IceCream'];

const CATEGORY_EMOJIS = {
  Pizza: '🍕', Burger: '🍔', Chips: '🍟', Coke: '🥤', Sprite: '🍹', IceCream: '🍦'
};

// Default Unsplash food photos per category
const CATEGORY_IMAGES = {
  Pizza: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
  Burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
  Chips: 'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=400&q=80',
  Coke: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80',
  Sprite: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&q=80',
  IceCream: 'https://images.unsplash.com/photo-1567206563114-c179706e7e71?w=400&q=80',
};

// Additional variety images per category
const CATEGORY_ALT_IMAGES = {
  Pizza: [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80',
  ],
  Burger: [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&q=80',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80',
  ],
  Chips: [
    'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=400&q=80',
    'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80',
  ],
  Coke: [
    'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80',
    'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80',
  ],
  Sprite: [
    'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&q=80',
  ],
  IceCream: [
    'https://images.unsplash.com/photo-1567206563114-c179706e7e71?w=400&q=80',
    'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&q=80',
    'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&q=80',
  ],
};

function getItemImage(item, index = 0) {
  if (item.imageUrl) return item.imageUrl;
  const imgs = CATEGORY_ALT_IMAGES[item.category] || [];
  return imgs[index % imgs.length] || CATEGORY_IMAGES[item.category] || '';
}

// ===========================
// TOAST
// ===========================
function Toast({ notification }) {
  if (!notification) return null;
  return (
    <div className={`toast ${notification.type}`}>
      <span>{notification.type === 'success' ? '✓' : '✕'}</span>
      {notification.text}
    </div>
  );
}

// ===========================
// CONFIRM MODAL
// ===========================
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="confirm-modal" onClick={onCancel}>
      <div className="confirm-box" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon">🗑️</div>
        <div className="confirm-title">{title}</div>
        <div className="confirm-msg">{message}</div>
        <div className="confirm-actions">
          <button className="confirm-cancel" onClick={onCancel}>Cancel</button>
          <button className="confirm-delete" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ===========================
// IMAGE UPLOAD
// ===========================
function ImageUpload({ value, onChange }) {
  const ref = useRef(null);
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert('Image must be under 3MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div className={`img-upload ${value ? 'has-img img-upload-has-overlay' : ''}`} onClick={() => ref.current?.click()}>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      {value ? (
        <img className="img-upload-preview" src={value} alt="Preview" />
      ) : (
        <div className="img-upload-placeholder">
          <div className="img-upload-icon">📷</div>
          <div className="img-upload-text">Add Food Photo</div>
          <div className="img-upload-hint">Tap to upload · Max 3MB</div>
        </div>
      )}
    </div>
  );
}

// ===========================
// FOOD CARD (GRID)
// ===========================
function FoodCard({ item, index, onAdd, isCustomer }) {
  const img = getItemImage(item, index);
  return (
    <div className="food-card">
      <div className="food-card-img">
        {img ? (
          <img src={img} alt={item.name} loading="lazy" onError={e => { e.target.style.display = 'none'; }} />
        ) : null}
        <div className="food-card-emoji-fallback" style={{ opacity: img ? 0 : 1 }}>
          {CATEGORY_EMOJIS[item.category]}
        </div>
        <div className="food-card-fav">❤️</div>
      </div>
      <div className="food-card-body">
        <div className="food-card-cat">{item.category}</div>
        <div className="food-card-name">{item.name}</div>
        <div className="food-card-desc">{item.description || 'Freshly made and served hot.'}</div>
        <div className="food-card-footer">
          <div className="food-card-price"><sup>R</sup>{parseFloat(item.price).toFixed(2)}</div>
          {isCustomer && (
            <button className="add-circle-btn" onClick={() => onAdd(item)}>+</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ===========================
// FOOD LIST CARD
// ===========================
function FoodListCard({ item, index, onAdd, isCustomer }) {
  const img = getItemImage(item, index);
  return (
    <div className="food-list-card" style={{ margin: '0 16px' }}>
      <div className="food-list-img">
        {img && <img src={img} alt={item.name} loading="lazy" onError={e => { e.target.style.display = 'none'; }} />}
        {!img && <span>{CATEGORY_EMOJIS[item.category]}</span>}
      </div>
      <div className="food-list-info">
        <div className="food-list-cat">{item.category}</div>
        <div className="food-list-name">{item.name}</div>
        <div className="food-list-price"><sup>R</sup>{parseFloat(item.price).toFixed(2)}</div>
      </div>
      {isCustomer && (
        <button className="add-circle-btn" onClick={() => onAdd(item)}>+</button>
      )}
    </div>
  );
}

// ===========================
// BOTTOM NAV
// ===========================
function BottomNav({ activeTab, setActiveTab, user, cartCount }) {
  const customerTabs = [
    { id: 'menu', icon: '🏠', label: 'Home' },
    { id: 'browse', icon: '🍽️', label: 'Menu' },
    { id: 'cart', icon: '🛒', label: 'Cart', badge: cartCount },
    { id: 'orders', icon: '📋', label: 'Orders' },
  ];
  const cashierTabs = [
    { id: 'menu', icon: '🏠', label: 'Home' },
    { id: 'browse', icon: '🍽️', label: 'Menu' },
    { id: 'orders', icon: '📋', label: 'Orders' },
  ];
  const adminTabs = [
    { id: 'dashboard', icon: '📊', label: 'Stats' },
    { id: 'menu-editor', icon: '✏️', label: 'Menu' },
    { id: 'orders', icon: '📋', label: 'Orders' },
  ];

  const tabs = user?.role === 'admin' ? adminTabs : user?.role === 'cashier' ? cashierTabs : customerTabs;

  return (
    <nav className="bottom-nav">
      {tabs.map(t => (
        <button key={t.id} className={`nav-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
          <div className="nav-btn-icon" style={{ position: 'relative' }}>
            {t.icon}
            {t.badge > 0 && <div className="nav-cart-badge">{t.badge > 9 ? '9+' : t.badge}</div>}
          </div>
          <span className="nav-btn-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ===========================
// STATUS BAR
// ===========================
function StatusBar() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="status-bar">
      <span className="status-time">{time}</span>
      <div className="status-icons">
        <span>●●●</span>
        <span>WiFi</span>
        <span>🔋</span>
      </div>
    </div>
  );
}

// ===========================
// MAIN APP
// ===========================
export default function App() {
  // Auth
  const [token, setToken] = useState(localStorage.getItem('auth_token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('auth_user') || 'null'));
  const [authTab, setAuthTab] = useState('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '', role: 'customer' });
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  // App
  const [activeTab, setActiveTab] = useState('menu');
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [serverStatus, setServerStatus] = useState({ success: false });
  const [notification, setNotification] = useState(null);

  // Search/filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Cart
  const [cart, setCart] = useState([]);

  // Admin editor
  const [showForm, setShowForm] = useState(false);
  const [menuForm, setMenuForm] = useState({ id: '', name: '', category: 'Pizza', price: '', description: '', imageUrl: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Delete
  const [deleteModal, setDeleteModal] = useState({ open: false, itemId: null, itemName: '' });

  // ====== HELPERS ======
  const checkStatus = async () => {
    try {
      const r = await fetch(`${API_URL}/status`);
      setServerStatus(await r.json());
    } catch { setServerStatus({ success: false }); }
  };

  const apiRequest = async (method, path, body = null) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_URL}${path}`, {
      method, headers, body: body ? JSON.stringify(body) : null
    });
    if (res.status === 401) { handleLogout(); throw new Error('Session expired'); }
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  };

  const showToast = (text, type = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ====== EFFECTS ======
  useEffect(() => {
    checkStatus();
    const iv = setInterval(checkStatus, 30000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => { if (token) fetchData(); }, [token]);

  const fetchData = async () => {
    if (!token) return;
    try {
      const m = await apiRequest('GET', '/menu');
      setMenuItems(Array.isArray(m.data) ? m.data : []);
      const o = await apiRequest('GET', '/orders');
      setOrders(Array.isArray(o.data) ? o.data : []);
    } catch (e) { console.error(e); }
  };

  // ====== AUTH ======
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError(''); setAuthMessage('');
    if (!authForm.username || !authForm.password) { setAuthError('Fill in all fields.'); return; }
    try {
      if (authTab === 'login') {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: authForm.username, password: authForm.password })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setToken(data.token); setUser(data.cashier);
          localStorage.setItem('auth_token', data.token);
          localStorage.setItem('auth_user', JSON.stringify(data.cashier));
          if (data.cashier.role === 'admin') setActiveTab('dashboard');
          else if (data.cashier.role === 'cashier') setActiveTab('orders');
          else setActiveTab('menu');
          showToast(`Welcome, ${data.cashier.username}! 👋`);
        } else { setAuthError(data.message || 'Invalid credentials.'); }
      } else {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(authForm)
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setAuthMessage('Account created! Sign in now.');
          setAuthTab('login');
          setAuthForm({ username: '', password: '', role: 'customer' });
        } else { setAuthError(data.message || 'Registration failed.'); }
      }
    } catch { setAuthError('Connection error. Is the server running?'); }
  };

  const handleLogout = () => {
    setToken(null); setUser(null); setCart([]);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  // ====== CART ======
  const addToCart = (item) => {
    const id = item._id || item.id;
    const ex = cart.find(c => (c._id || c.id) === id);
    if (ex) { setCart(cart.map(c => (c._id || c.id) === id ? { ...c, quantity: c.quantity + 1 } : c)); }
    else { setCart([...cart, { ...item, quantity: 1 }]); }
    showToast(`${item.name} added to cart 🛒`);
  };

  const updateQty = (itemId, delta) => {
    setCart(prev => prev.reduce((acc, c) => {
      const cid = c._id || c.id;
      if (cid === itemId) { const q = c.quantity + delta; if (q > 0) acc.push({ ...c, quantity: q }); }
      else acc.push(c);
      return acc;
    }, []));
  };

  const cartTotal = cart.reduce((s, c) => s + parseFloat(c.price) * c.quantity, 0);
  const serviceFee = cartTotal > 0 ? 15 : 0;
  const grandTotal = cartTotal + serviceFee;

  const handleCheckout = async () => {
    if (!cart.length) return;
    try {
      await apiRequest('POST', '/orders', {
        category: cart[0].category || 'Pizza',
        items: cart.map(c => ({ description: c.name, quantity: c.quantity, unitPrice: parseFloat(c.price) }))
      });
      setCart([]); setActiveTab('orders'); fetchData();
      showToast('Order placed! 🎉');
    } catch (e) { showToast(e.message, 'error'); }
  };

  // ====== ADMIN CRUD ======
  const openAdd = () => {
    setMenuForm({ id: '', name: '', category: 'Pizza', price: '', description: '', imageUrl: '' });
    setIsEditing(false); setShowForm(true);
  };

  const openEdit = (item) => {
    setMenuForm({
      id: item._id || item.id,
      name: item.name, category: item.category,
      price: item.price, description: item.description || '',
      imageUrl: item.imageUrl || ''
    });
    setIsEditing(true); setShowForm(true);
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    if (!menuForm.name || !menuForm.price) return;
    try {
      const payload = { name: menuForm.name, category: menuForm.category, price: parseFloat(menuForm.price), description: menuForm.description, imageUrl: menuForm.imageUrl };
      if (isEditing) { await apiRequest('PUT', `/menu/${menuForm.id}`, payload); showToast('Item updated! ✅'); }
      else { await apiRequest('POST', '/menu', payload); showToast('Item added! ✅'); }
      setShowForm(false); fetchData();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDeleteClick = (item) => setDeleteModal({ open: true, itemId: item._id || item.id, itemName: item.name });

  const handleDeleteConfirm = async () => {
    const { itemId } = deleteModal;
    setDeleteModal({ open: false, itemId: null, itemName: '' });
    try {
      await apiRequest('DELETE', `/menu/${itemId}`);
      showToast('Item deleted.'); fetchData();
    } catch (e) { showToast(e.message, 'error'); }
  };

  // ====== FILTERED MENU ======
  const filteredMenu = menuItems.filter(item => {
    const mSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const mCat = selectedCategory === 'All' || item.category === selectedCategory;
    return mSearch && mCat;
  });

  // ========================================
  // AUTH SCREEN (Full page, no phone shell)
  // ========================================
  if (!token) {
    return (
      <div className="phone-shell">
        <div className="phone-frame">
          <div className="phone-notch" />
          <StatusBar />
          <div className="screen-scroll">
            <div className="auth-screen">
              <div className="auth-hero-img">
                <div className="auth-hero-emojis">🍕 🍔 🍟</div>
                <div className="auth-hero-title">Fas_Food App</div>
                <div className="auth-hero-sub">Order your favorites, fast &amp; fresh</div>
              </div>

              <div className="auth-body">
                <div className="auth-tab-row">
                  <button className={`auth-tab-btn ${authTab === 'login' ? 'active' : ''}`}
                    onClick={() => { setAuthTab('login'); setAuthError(''); setAuthMessage(''); }}>
                    Sign In
                  </button>
                  <button className={`auth-tab-btn ${authTab === 'register' ? 'active' : ''}`}
                    onClick={() => { setAuthTab('register'); setAuthError(''); setAuthMessage(''); }}>
                    Sign Up
                  </button>
                </div>

                {authError && <div className="alert alert-error">⚠️ {authError}</div>}
                {authMessage && <div className="alert alert-success">✅ {authMessage}</div>}

                <form onSubmit={handleAuth}>
                  <div className="input-group">
                    <label className="input-label">Username</label>
                    <div className="input-wrap">
                      <span className="input-icon">👤</span>
                      <input type="text" placeholder="e.g. yaqoob" value={authForm.username}
                        onChange={e => setAuthForm({ ...authForm, username: e.target.value })} required />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Password</label>
                    <div className="input-wrap">
                      <span className="input-icon">🔒</span>
                      <input type="password" placeholder="••••••••" value={authForm.password}
                        onChange={e => setAuthForm({ ...authForm, password: e.target.value })} required />
                    </div>
                  </div>

                  {authTab === 'register' && (
                    <div className="input-group">
                      <label className="input-label">I am a…</label>
                      <div className="input-wrap">
                        <span className="input-icon">🎭</span>
                        <select value={authForm.role} onChange={e => setAuthForm({ ...authForm, role: e.target.value })}>
                          <option value="customer">🛒 Customer — Order Meals</option>
                          <option value="cashier">🧾 Cashier — Process Orders</option>
                          <option value="admin">⚙️ Admin — Full Management</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '8px' }}>
                    <button type="submit" className="btn-primary">
                      {authTab === 'login' ? '🚀 Sign In' : '✨ Create Account'}
                    </button>
                  </div>
                </form>

                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Default admin: <strong>adminuser</strong> / <strong>password123</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // MAIN APP SHELL
  // ========================================
  return (
    <div className="phone-shell">
      <div className="phone-frame" style={{ position: 'relative' }}>
        <div className="phone-notch" />
        <StatusBar />

        <Toast notification={notification} />

        <ConfirmModal
          isOpen={deleteModal.open}
          title="Delete Item"
          message={`Remove "${deleteModal.itemName}" from the menu? This cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModal({ open: false, itemId: null, itemName: '' })}
        />

        {/* Add/Edit form modal */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <div className="modal-header">
                <span className="modal-title">{isEditing ? '✏️ Edit Item' : '➕ Add Item'}</span>
                <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleMenuSubmit}>
                  <div className="input-group">
                    <label className="input-label">Food Photo</label>
                    <ImageUpload value={menuForm.imageUrl} onChange={v => setMenuForm({ ...menuForm, imageUrl: v })} />
                    {menuForm.imageUrl && (
                      <button type="button" onClick={() => setMenuForm({ ...menuForm, imageUrl: '' })}
                        style={{ fontSize: '0.78rem', color: 'var(--red)', background: 'none', border: 'none', marginBottom: '12px' }}>
                        🗑️ Remove photo
                      </button>
                    )}
                  </div>

                  <div className="input-group">
                    <label className="input-label">Item Name *</label>
                    <div className="input-wrap">
                      <span className="input-icon">🍽️</span>
                      <input type="text" placeholder="e.g. Pepperoni Pizza" value={menuForm.name}
                        onChange={e => setMenuForm({ ...menuForm, name: e.target.value })} required />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Category *</label>
                    <div className="input-wrap">
                      <span className="input-icon">📂</span>
                      <select value={menuForm.category} onChange={e => setMenuForm({ ...menuForm, category: e.target.value })}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_EMOJIS[c]} {c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Price (ZAR) *</label>
                    <div className="input-wrap">
                      <span className="input-icon">💰</span>
                      <input type="number" step="0.01" min="0" placeholder="e.g. 89.99" value={menuForm.price}
                        onChange={e => setMenuForm({ ...menuForm, price: e.target.value })} required />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Description</label>
                    <div className="input-wrap input-wrap-textarea">
                      <textarea placeholder="Describe this dish..." value={menuForm.description}
                        onChange={e => setMenuForm({ ...menuForm, description: e.target.value })} />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                    {isEditing ? '✅ Update Item' : '➕ Add to Menu'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ======== SCROLL CONTENT ======== */}
        <div className="screen-scroll">

          {/* ==================== HOME / MENU (customer & cashier) ==================== */}
          {activeTab === 'menu' && (
            <div>
              {/* Header */}
              <div className="home-header">
                <div>
                  <div className="home-greeting">Good day! 👋</div>
                  <div className="home-username">{user?.username}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`role-tag role-${user?.role}`}>{user?.role}</span>
                  <div className="home-avatar">{(user?.username || 'U')[0].toUpperCase()}</div>
                </div>
              </div>

              {/* Search */}
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input placeholder="Search for pizza, burger..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)} />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', fontSize: '1rem', color: 'var(--text-muted)' }}>✕</button>
                )}
              </div>

              {/* Hero Banner */}
              {!searchQuery && selectedCategory === 'All' && (
                <div className="hero-banner">
                  <div className="hero-text">
                    <span className="hero-tag">🔥 Today's Special</span>
                    <div className="hero-title">Hungry? Order<br />your favourite!</div>
                    <button className="hero-cta" onClick={() => setSelectedCategory('Pizza')}>Order Now →</button>
                  </div>
                  <div className="hero-emoji-big">🍕</div>
                </div>
              )}

              {/* Categories */}
              <div className="screen-section">
                <div className="section-header">
                  <span className="section-title">Categories</span>
                  <button className="btn-ghost" onClick={() => setSelectedCategory('All')}>See All</button>
                </div>
                <div className="cat-row">
                  <div className={`cat-chip ${selectedCategory === 'All' ? 'active' : ''}`} onClick={() => setSelectedCategory('All')}>
                    <span className="cat-chip-emoji">🍽️</span>
                    <span className="cat-chip-label">All</span>
                  </div>
                  {CATEGORIES.map(cat => (
                    <div key={cat} className={`cat-chip ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>
                      <span className="cat-chip-emoji">{CATEGORY_EMOJIS[cat]}</span>
                      <span className="cat-chip-label">{cat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Menu Grid */}
              <div className="screen-section">
                <div className="section-header">
                  <span className="section-title">
                    {selectedCategory === 'All' ? 'All Items' : selectedCategory}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{filteredMenu.length} items</span>
                </div>

                {filteredMenu.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <div className="empty-title">No items found</div>
                    <div className="empty-sub">Try another category or search term</div>
                  </div>
                ) : (
                  <div className="menu-grid" style={{ paddingBottom: '16px' }}>
                    {filteredMenu.map((item, i) => (
                      <FoodCard
                        key={item._id || item.id}
                        item={item}
                        index={i}
                        onAdd={addToCart}
                        isCustomer={user?.role === 'customer'}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== BROWSE (all menu list view) ==================== */}
          {activeTab === 'browse' && (
            <div>
              <div className="home-header">
                <div>
                  <div className="home-greeting">Browse all</div>
                  <div className="home-username">Full Menu</div>
                </div>
                <div className={`role-tag role-${user?.role}`}>{user?.role}</div>
              </div>
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <div className="cat-row" style={{ margin: '0 0 16px', padding: '0 16px 4px' }}>
                {['All', ...CATEGORIES].map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    className={selectedCategory === cat ? 'btn-sm-primary' : 'btn-sm-ghost'}
                    style={{ marginBottom: '4px' }}>
                    {cat === 'All' ? '🍽️ All' : `${CATEGORY_EMOJIS[cat]} ${cat}`}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '16px' }}>
                {filteredMenu.map((item, i) => (
                  <FoodListCard key={item._id || item.id} item={item} index={i} onAdd={addToCart} isCustomer={user?.role === 'customer'} />
                ))}
                {filteredMenu.length === 0 && (
                  <div className="empty-state"><div className="empty-icon">🔍</div><div className="empty-title">No items found</div></div>
                )}
              </div>
            </div>
          )}

          {/* ==================== CART ==================== */}
          {activeTab === 'cart' && (
            <div>
              <div className="cart-screen-header">
                <div className="cart-screen-title">My Cart</div>
                {cart.length > 0 && <span className="cart-count-pill">{cart.reduce((s, c) => s + c.quantity, 0)} items</span>}
              </div>

              {cart.length === 0 ? (
                <div className="empty-state" style={{ marginTop: '40px' }}>
                  <div className="empty-icon">🛒</div>
                  <div className="empty-title">Cart is empty</div>
                  <div className="empty-sub">Add items from the menu to get started</div>
                  <button className="btn-sm-primary" style={{ marginTop: '16px' }} onClick={() => setActiveTab('menu')}>Browse Menu</button>
                </div>
              ) : (
                <>
                  <div className="cart-items-list">
                    {cart.map((item) => {
                      const cid = item._id || item.id;
                      const img = getItemImage(item, 0);
                      return (
                        <div key={cid} className="cart-item">
                          <div className="cart-item-img">
                            {img ? <img src={img} alt={item.name} onError={e => e.target.style.display = 'none'} /> : null}
                            {!img && <span>{CATEGORY_EMOJIS[item.category]}</span>}
                          </div>
                          <div className="cart-item-info">
                            <div className="cart-item-name">{item.name}</div>
                            <div className="cart-item-price">R{parseFloat(item.price).toFixed(2)} each</div>
                            <div className="cart-qty-row">
                              <button className="qty-btn" onClick={() => updateQty(cid, -1)}>−</button>
                              <span className="cart-qty-num">{item.quantity}</span>
                              <button className="qty-btn" onClick={() => updateQty(cid, 1)}>+</button>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)' }}>
                              R{(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="cart-summary-box">
                    <div className="cart-summary-title">Order Summary</div>
                    <div className="summary-row"><span>Subtotal</span><span>R{cartTotal.toFixed(2)}</span></div>
                    <div className="summary-row"><span>Service Fee</span><span>R{serviceFee.toFixed(2)}</span></div>
                    <div className="summary-row grand"><span>Total</span><span>R{grandTotal.toFixed(2)}</span></div>
                  </div>

                  <button className="cart-checkout-btn" onClick={handleCheckout}>
                    🛒 Place Order — R{grandTotal.toFixed(2)}
                  </button>
                  <div style={{ height: '16px' }} />
                </>
              )}
            </div>
          )}

          {/* ==================== ORDERS ==================== */}
          {activeTab === 'orders' && (
            <div>
              <div className="orders-screen-header">
                <div className="orders-screen-title">
                  {user?.role === 'customer' ? 'My Orders' : user?.role === 'cashier' ? 'Order Queue' : 'Order Ledger'}
                </div>
                <div className="orders-screen-sub">{orders.length} records</div>
              </div>

              {orders.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <div className="empty-title">No orders yet</div>
                  <div className="empty-sub">Orders will appear here once placed</div>
                </div>
              ) : (
                <div style={{ paddingBottom: '16px' }}>
                  {orders.map((order, i) => (
                    <div key={order._id || order.id || i} className="order-card">
                      <div className="order-card-header">
                        <span className="order-card-id">#{(order._id || order.id || '').substring(0, 10)}</span>
                        <span className="order-status done">✓ Completed</span>
                      </div>
                      <div className="order-card-items">
                        {order.items && order.items.map((it, idx) => (
                          <div key={idx}>{it.quantity}× {it.description}</div>
                        ))}
                      </div>
                      <div className="order-card-footer">
                        <span className="order-card-cat">{CATEGORY_EMOJIS[order.category]} {order.category}</span>
                        <span className="order-card-total">R{parseFloat(order.totalAmount || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== ADMIN: DASHBOARD ==================== */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="dashboard-header" style={{ paddingBottom: '0' }}>
                <div className="home-header" style={{ paddingBottom: '0' }}>
                  <div>
                    <div className="home-greeting">Admin Panel</div>
                    <div className="home-username">{user?.username}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className={`role-tag role-${user?.role}`}>{user?.role}</span>
                    <button className="btn-ghost" onClick={handleLogout} style={{ color: 'var(--red)' }}>🚪</button>
                  </div>
                </div>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-val" style={{ color: 'var(--primary)' }}>
                    R{orders.reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0).toFixed(0)}
                  </div>
                  <div className="stat-lbl">Revenue</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-val" style={{ color: 'var(--green)' }}>{orders.length}</div>
                  <div className="stat-lbl">Orders</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🍽️</div>
                  <div className="stat-val" style={{ color: 'var(--purple)' }}>{menuItems.length}</div>
                  <div className="stat-lbl">Menu Items</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-val" style={{ color: 'var(--yellow)' }}>
                    {orders.length > 0
                      ? `R${(orders.reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0) / orders.length).toFixed(0)}`
                      : 'R0'}
                  </div>
                  <div className="stat-lbl">Avg Order</div>
                </div>
              </div>

              {/* Recent orders mini list */}
              <div style={{ padding: '20px 16px 0' }}>
                <div className="section-header">
                  <span className="section-title">Recent Orders</span>
                </div>
                {orders.slice(0, 4).map((o, i) => (
                  <div key={i} style={{
                    background: 'white', borderRadius: '14px', padding: '12px 14px', marginBottom: '10px',
                    border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    boxShadow: 'var(--shadow-xs)'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>
                        #{(o._id || o.id || '').substring(0, 8)}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {CATEGORY_EMOJIS[o.category]} {o.category} • {o.cashier || 'customer'}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--primary)' }}>
                      R{parseFloat(o.totalAmount || 0).toFixed(2)}
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="empty-state"><div className="empty-icon">📊</div><div className="empty-title">No data yet</div></div>
                )}
              </div>
              <div style={{ height: '16px' }} />
            </div>
          )}

          {/* ==================== ADMIN: MENU EDITOR ==================== */}
          {activeTab === 'menu-editor' && (
            <div>
              <div className="editor-header">
                <div>
                  <div className="home-greeting">Manage</div>
                  <div className="home-username">Menu Items</div>
                </div>
                <button className="add-btn-round" onClick={openAdd} title="Add new item">+</button>
              </div>

              {menuItems.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🍽️</div>
                  <div className="empty-title">No items yet</div>
                  <div className="empty-sub">Tap + to add your first menu item</div>
                </div>
              ) : (
                <div style={{ paddingBottom: '16px' }}>
                  {menuItems.map((item, i) => {
                    const img = getItemImage(item, i);
                    return (
                      <div key={item._id || item.id} className="admin-item-card">
                        <div className="admin-item-img">
                          {img ? <img src={img} alt={item.name} onError={e => e.target.style.display = 'none'} /> : null}
                          {!img && <span>{CATEGORY_EMOJIS[item.category]}</span>}
                        </div>
                        <div className="admin-item-info">
                          <div className="admin-item-name">{item.name}</div>
                          <div className="admin-item-meta">{item.category}</div>
                        </div>
                        <span className="admin-item-price">R{parseFloat(item.price).toFixed(2)}</span>
                        <div className="admin-item-actions">
                          <button className="btn-icon" onClick={() => openEdit(item)} title="Edit">✏️</button>
                          <button className="btn-icon danger" onClick={() => handleDeleteClick(item)} title="Delete">🗑️</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* ====== BOTTOM NAVIGATION ====== */}
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          cartCount={cart.reduce((s, c) => s + c.quantity, 0)}
        />
      </div>
    </div>
  );
}