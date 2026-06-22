import React, { useState, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ===========================
// ICONS (Minimalist SVGs)
// ===========================
const Icons = {
  Home: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
  Search: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  Bag: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>,
  List: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>,
  Chart: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>,
  Edit: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  Lock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
  Shield: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Minus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Trash: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Camera: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
};

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
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center', color: 'var(--red)' }}>
          <Icons.Trash />
        </div>
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
    <div className={`img-upload ${value ? 'has-img' : ''}`} onClick={() => ref.current?.click()}>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      {value ? (
        <img className="img-upload-preview" src={value} alt="Preview" />
      ) : (
        <div className="img-upload-placeholder">
          <div style={{ color: 'var(--text-muted)' }}><Icons.Camera /></div>
          <div className="img-upload-text">Upload Photo</div>
          <div className="img-upload-hint">JPEG or PNG, max 3MB</div>
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
      </div>
      <div className="food-card-body">
        <div className="food-card-name">{item.name}</div>
        <div className="food-card-desc">{item.description || 'Freshly made and served hot.'}</div>
        <div className="food-card-footer">
          <div className="food-card-price"><sup>R</sup>{parseFloat(item.price).toFixed(2)}</div>
          {isCustomer && (
            <button className="add-circle-btn" onClick={() => onAdd(item)}><Icons.Plus /></button>
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
    <div className="food-list-card">
      <div className="food-list-img">
        {img ? <img src={img} alt={item.name} loading="lazy" onError={e => { e.target.style.display = 'none'; }} /> : null}
      </div>
      <div className="food-list-info">
        <div className="food-list-name">{item.name}</div>
        <div className="food-list-cat">{item.category}</div>
        <div className="food-list-price"><sup>R</sup>{parseFloat(item.price).toFixed(2)}</div>
      </div>
      {isCustomer && (
        <button className="add-circle-btn" onClick={() => onAdd(item)}><Icons.Plus /></button>
      )}
    </div>
  );
}

// ===========================
// BOTTOM NAV
// ===========================
function BottomNav({ activeTab, setActiveTab, user, cartCount }) {
  const customerTabs = [
    { id: 'menu', icon: <Icons.Home />, label: 'Home' },
    { id: 'browse', icon: <Icons.Search />, label: 'Browse' },
    { id: 'cart', icon: <Icons.Bag />, label: 'Cart', badge: cartCount },
    { id: 'orders', icon: <Icons.List />, label: 'Orders' },
  ];
  const cashierTabs = [
    { id: 'menu', icon: <Icons.Home />, label: 'Home' },
    { id: 'browse', icon: <Icons.Search />, label: 'Browse' },
    { id: 'orders', icon: <Icons.List />, label: 'Queue' },
  ];
  const adminTabs = [
    { id: 'dashboard', icon: <Icons.Chart />, label: 'Overview' },
    { id: 'menu-editor', icon: <Icons.Edit />, label: 'Menu' },
    { id: 'orders', icon: <Icons.List />, label: 'Ledger' },
  ];

  const tabs = user?.role === 'admin' ? adminTabs : user?.role === 'cashier' ? cashierTabs : customerTabs;

  return (
    <nav className="bottom-nav">
      {tabs.map(t => (
        <button key={t.id} className={`nav-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
          <div className="nav-btn-icon">
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect><line x1="23" y1="13" x2="23" y2="11"></line></svg>
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
    showToast(`Added ${item.name}`);
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
      showToast('Order placed successfully.');
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
      if (isEditing) { await apiRequest('PUT', `/menu/${menuForm.id}`, payload); showToast('Item updated.'); }
      else { await apiRequest('POST', '/menu', payload); showToast('Item added.'); }
      setShowForm(false); fetchData();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDeleteClick = (item) => setDeleteModal({ open: true, itemId: item._id || item.id, itemName: item.name });

  const handleDeleteConfirm = async () => {
    const { itemId } = deleteModal;
    setDeleteModal({ open: false, itemId: null, itemName: '' });
    try {
      await apiRequest('DELETE', `/menu/${itemId}`);
      showToast('Item removed.'); fetchData();
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
  // AUTH SCREEN
  // ========================================
  if (!token) {
    return (
      <div className="phone-shell">
        <div className="phone-frame" style={{ background: '#FFFFFF' }}>
          <div className="phone-notch" />
          <StatusBar />
          <div className="screen-scroll">
            <div className="auth-screen">
              <div className="auth-hero">
                <div className="auth-hero-title">Fas_Food</div>
                <div className="auth-hero-sub">Premium dining, delivered to your door.</div>
              </div>

              <div className="auth-body">
                <div className="auth-tab-row">
                  <button className={`auth-tab-btn ${authTab === 'login' ? 'active' : ''}`}
                    onClick={() => { setAuthTab('login'); setAuthError(''); setAuthMessage(''); }}>
                    Sign In
                  </button>
                  <button className={`auth-tab-btn ${authTab === 'register' ? 'active' : ''}`}
                    onClick={() => { setAuthTab('register'); setAuthError(''); setAuthMessage(''); }}>
                    Register
                  </button>
                </div>

                {authError && <div className="alert alert-error">{authError}</div>}
                {authMessage && <div className="alert alert-success">{authMessage}</div>}

                <form onSubmit={handleAuth}>
                  <div className="input-group">
                    <label className="input-label">Username</label>
                    <div className="input-wrap">
                      <div className="input-icon"><Icons.User /></div>
                      <input type="text" placeholder="Enter username" value={authForm.username}
                        onChange={e => setAuthForm({ ...authForm, username: e.target.value })} required />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Password</label>
                    <div className="input-wrap">
                      <div className="input-icon"><Icons.Lock /></div>
                      <input type="password" placeholder="••••••••" value={authForm.password}
                        onChange={e => setAuthForm({ ...authForm, password: e.target.value })} required />
                    </div>
                  </div>

                  {authTab === 'register' && (
                    <div className="input-group">
                      <label className="input-label">Account Type</label>
                      <div className="input-wrap">
                        <div className="input-icon"><Icons.Shield /></div>
                        <select value={authForm.role} onChange={e => setAuthForm({ ...authForm, role: e.target.value })}>
                          <option value="customer">Customer</option>
                          <option value="cashier">Cashier</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '32px' }}>
                    <button type="submit" className="btn-primary">
                      {authTab === 'login' ? 'Continue' : 'Create Account'}
                    </button>
                  </div>
                </form>

                <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Demo Admin: <strong>adminuser</strong> / <strong>password123</strong>
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
      <div className="phone-frame">
        <div className="phone-notch" />
        <StatusBar />

        <Toast notification={notification} />

        <ConfirmModal
          isOpen={deleteModal.open}
          title="Delete Item"
          message={`Are you sure you want to remove "${deleteModal.itemName}" from the menu?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModal({ open: false, itemId: null, itemName: '' })}
        />

        {/* Add/Edit form modal */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <div className="modal-header">
                <span className="modal-title">{isEditing ? 'Edit Item' : 'New Item'}</span>
                <button className="modal-close" onClick={() => setShowForm(false)}><Icons.Plus style={{transform: 'rotate(45deg)'}} /></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleMenuSubmit}>
                  <div className="input-group">
                    <label className="input-label">Item Photo</label>
                    <ImageUpload value={menuForm.imageUrl} onChange={v => setMenuForm({ ...menuForm, imageUrl: v })} />
                    {menuForm.imageUrl && (
                      <button type="button" onClick={() => setMenuForm({ ...menuForm, imageUrl: '' })}
                        style={{ fontSize: '0.85rem', color: 'var(--red)', background: 'none', border: 'none', marginBottom: '16px', fontWeight: 500 }}>
                        Remove photo
                      </button>
                    )}
                  </div>

                  <div className="input-group">
                    <label className="input-label">Item Name</label>
                    <div className="input-wrap">
                      <input type="text" placeholder="e.g. Classic Cheeseburger" value={menuForm.name}
                        onChange={e => setMenuForm({ ...menuForm, name: e.target.value })} required />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Category</label>
                    <div className="input-wrap">
                      <select value={menuForm.category} onChange={e => setMenuForm({ ...menuForm, category: e.target.value })}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Price (ZAR)</label>
                    <div className="input-wrap">
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

                  <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>
                    {isEditing ? 'Save Changes' : 'Add Item'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ======== SCROLL CONTENT ======== */}
        <div className="screen-scroll">

          {/* ==================== HOME / MENU ==================== */}
          {activeTab === 'menu' && (
            <div>
              {/* Header */}
              <div className="home-header">
                <div>
                  <div className="home-greeting">Good day</div>
                  <div className="home-username">{user?.username}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`role-tag`}>{user?.role}</span>
                  <div className="home-avatar">{(user?.username || 'U')[0].toUpperCase()}</div>
                </div>
              </div>

              {/* Search */}
              <div className="search-bar">
                <span className="search-icon"><Icons.Search /></span>
                <input placeholder="Find your craving..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)} />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><Icons.Plus style={{transform: 'rotate(45deg)'}} /></button>
                )}
              </div>

              {/* Minimal Hero Banner */}
              {!searchQuery && selectedCategory === 'All' && (
                <div className="hero-banner">
                  <div className="hero-text">
                    <span className="hero-tag">Curated</span>
                    <div className="hero-title">Exclusive<br />dishes for you</div>
                    <button className="hero-cta" onClick={() => setSelectedCategory('Burger')}>View Collection</button>
                  </div>
                  {/* Subtle decorative image instead of emoji */}
                  <img className="hero-image" src={CATEGORY_IMAGES.Burger} alt="Featured" style={{ borderRadius: '50%', objectFit: 'cover' }} />
                </div>
              )}

              {/* Categories */}
              <div style={{ marginBottom: '24px' }}>
                <div className="section-header">
                  <span className="section-title">Explore</span>
                  <button className="btn-ghost" onClick={() => setSelectedCategory('All')}>See All</button>
                </div>
                <div className="cat-row">
                  <div className={`cat-chip ${selectedCategory === 'All' ? 'active' : ''}`} onClick={() => setSelectedCategory('All')}>
                    <span className="cat-chip-label">All Items</span>
                  </div>
                  {CATEGORIES.map(cat => (
                    <div key={cat} className={`cat-chip ${selectedCategory === cat ? 'active' : ''}`} onClick={() => setSelectedCategory(cat)}>
                      <span className="cat-chip-label" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span>{CATEGORY_EMOJIS[cat]}</span> {cat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Menu Grid */}
              <div style={{ paddingBottom: '24px' }}>
                <div className="section-header">
                  <span className="section-title">
                    {selectedCategory === 'All' ? 'Menu' : selectedCategory}
                  </span>
                </div>

                {filteredMenu.length === 0 ? (
                  <div className="empty-state">
                    <div style={{ color: 'var(--text-muted)', marginBottom: '16px' }}><Icons.Search /></div>
                    <div className="empty-title">No items found</div>
                    <div className="empty-sub">Try another category or search term</div>
                  </div>
                ) : (
                  <div className="menu-grid">
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

          {/* ==================== BROWSE (List View) ==================== */}
          {activeTab === 'browse' && (
            <div>
              <div className="home-header">
                <div>
                  <div className="home-greeting">Browse</div>
                  <div className="home-username">Full Directory</div>
                </div>
              </div>
              <div className="search-bar">
                <span className="search-icon"><Icons.Search /></span>
                <input placeholder="Search directory..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <div className="cat-row" style={{ margin: '0 0 20px', padding: '0 24px 8px' }}>
                {['All', ...CATEGORIES].map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    className={selectedCategory === cat ? 'btn-sm-primary' : 'btn-sm-ghost'}
                    style={{ marginBottom: '4px' }}>
                    {cat}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '24px' }}>
                {filteredMenu.map((item, i) => (
                  <FoodListCard key={item._id || item.id} item={item} index={i} onAdd={addToCart} isCustomer={user?.role === 'customer'} />
                ))}
                {filteredMenu.length === 0 && (
                  <div className="empty-state"><div className="empty-title">No items found</div></div>
                )}
              </div>
            </div>
          )}

          {/* ==================== CART ==================== */}
          {activeTab === 'cart' && (
            <div>
              <div className="cart-screen-header">
                <div className="cart-screen-title">Cart</div>
                {cart.length > 0 && <span className="cart-count-pill">{cart.reduce((s, c) => s + c.quantity, 0)}</span>}
              </div>

              {cart.length === 0 ? (
                <div className="empty-state" style={{ marginTop: '40px' }}>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}><Icons.Bag /></div>
                  <div className="empty-title">Your cart is empty</div>
                  <div className="empty-sub">Items you add will appear here</div>
                  <button className="btn-sm-primary" style={{ marginTop: '24px', padding: '0 24px' }} onClick={() => setActiveTab('menu')}>Start Ordering</button>
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
                          </div>
                          <div className="cart-item-info">
                            <div className="cart-item-name">{item.name}</div>
                            <div className="cart-item-price">R{parseFloat(item.price).toFixed(2)}</div>
                            <div className="cart-qty-row">
                              <button className="qty-btn" onClick={() => updateQty(cid, -1)}><Icons.Minus /></button>
                              <span className="cart-qty-num">{item.quantity}</span>
                              <button className="qty-btn" onClick={() => updateQty(cid, 1)}><Icons.Plus /></button>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
                              R{(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="cart-summary-box">
                    <div className="summary-row"><span>Subtotal</span><span style={{ color: 'var(--text)', fontWeight: 500 }}>R{cartTotal.toFixed(2)}</span></div>
                    <div className="summary-row"><span>Service Fee</span><span style={{ color: 'var(--text)', fontWeight: 500 }}>R{serviceFee.toFixed(2)}</span></div>
                    <div className="summary-row grand"><span>Total</span><span>R{grandTotal.toFixed(2)}</span></div>
                  </div>

                  <button className="btn-primary cart-checkout-btn" onClick={handleCheckout}>
                    Checkout
                  </button>
                  <div style={{ height: '24px' }} />
                </>
              )}
            </div>
          )}

          {/* ==================== ORDERS ==================== */}
          {activeTab === 'orders' && (
            <div>
              <div className="orders-screen-header">
                <div className="orders-screen-title">
                  {user?.role === 'customer' ? 'History' : user?.role === 'cashier' ? 'Queue' : 'Ledger'}
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="empty-state">
                  <div style={{ color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}><Icons.List /></div>
                  <div className="empty-title">No orders found</div>
                </div>
              ) : (
                <div style={{ paddingBottom: '24px' }}>
                  {orders.map((order, i) => (
                    <div key={order._id || order.id || i} className="order-card">
                      <div className="order-card-header">
                        <span className="order-card-id">#{(order._id || order.id || '').substring(0, 8)}</span>
                        <span className="order-status done">Completed</span>
                      </div>
                      <div className="order-card-items">
                        {order.items && order.items.map((it, idx) => (
                          <div key={idx}>{it.quantity} × {it.description}</div>
                        ))}
                      </div>
                      <div className="order-card-footer">
                        <span className="order-card-cat">{order.category}</span>
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
              <div className="home-header">
                <div>
                  <div className="home-greeting">Overview</div>
                  <div className="home-username">Dashboard</div>
                </div>
                <button className="btn-ghost" onClick={handleLogout} style={{ color: 'var(--text-muted)' }}>
                  <Icons.User /> Sign Out
                </button>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-val">R{orders.reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0).toFixed(0)}</div>
                  <div className="stat-lbl">Revenue</div>
                </div>
                <div className="stat-card">
                  <div className="stat-val">{orders.length}</div>
                  <div className="stat-lbl">Orders</div>
                </div>
                <div className="stat-card">
                  <div className="stat-val">{menuItems.length}</div>
                  <div className="stat-lbl">Items</div>
                </div>
                <div className="stat-card">
                  <div className="stat-val">
                    {orders.length > 0 ? `R${(orders.reduce((s, o) => s + (parseFloat(o.totalAmount) || 0), 0) / orders.length).toFixed(0)}` : 'R0'}
                  </div>
                  <div className="stat-lbl">Average</div>
                </div>
              </div>

              {/* Recent orders mini list */}
              <div style={{ padding: '32px 24px 0' }}>
                <div className="section-header" style={{ padding: 0 }}>
                  <span className="section-title">Recent Activity</span>
                </div>
                {orders.slice(0, 4).map((o, i) => (
                  <div key={i} style={{
                    background: 'var(--card-bg)', borderRadius: 'var(--r-md)', padding: '16px', marginBottom: '12px',
                    border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>
                        #{(o._id || o.id || '').substring(0, 8)}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {o.category} • {o.cashier || 'Customer'}
                      </div>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
                      R{parseFloat(o.totalAmount || 0).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ height: '24px' }} />
            </div>
          )}

          {/* ==================== ADMIN: MENU EDITOR ==================== */}
          {activeTab === 'menu-editor' && (
            <div>
              <div className="editor-header">
                <div className="orders-screen-title">Management</div>
                <button className="add-circle-btn" onClick={openAdd} style={{ background: 'var(--text)', color: 'white' }}>
                  <Icons.Plus />
                </button>
              </div>

              {menuItems.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-title">Menu is empty</div>
                  <div className="empty-sub">Tap + to add items</div>
                </div>
              ) : (
                <div style={{ paddingBottom: '24px' }}>
                  {menuItems.map((item, i) => {
                    const img = getItemImage(item, i);
                    return (
                      <div key={item._id || item.id} className="admin-item-card">
                        <div className="admin-item-img">
                          {img ? <img src={img} alt={item.name} onError={e => e.target.style.display = 'none'} /> : null}
                        </div>
                        <div className="admin-item-info">
                          <div className="admin-item-name">{item.name}</div>
                          <div className="admin-item-meta">{item.category}</div>
                        </div>
                        <span className="admin-item-price">R{parseFloat(item.price).toFixed(2)}</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn-icon" onClick={() => openEdit(item)}><Icons.Edit /></button>
                          <button className="btn-icon danger" onClick={() => handleDeleteClick(item)}><Icons.Trash /></button>
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