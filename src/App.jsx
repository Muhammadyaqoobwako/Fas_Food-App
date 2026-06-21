import React, { useState, useEffect } from 'react'

const API_URL = 'http://localhost:5000/api'

function App() {
  const [activeTab, setActiveTab] = useState('menu')
  const [menuItems, setMenuItems] = useState([])
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState(null)
  const [notification, setNotification] = useState(null)

  // Menu item form
  const [menuForm, setMenuForm] = useState({
    name: '', category: 'Pizza', price: '', description: ''
  })

  // Order form
  const [orderForm, setOrderForm] = useState({
    menuItemId: '', quantity: '1', cashier: ''
  })

  useEffect(() => {
    fetchStatus()
    fetchMenuItems()
    fetchOrders()
  }, [])

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/status`)
      const data = await res.json()
      setStatus(data)
    } catch (e) {
      setStatus({ success: false, status: 'offline' })
    }
  }

  const fetchMenuItems = async () => {
    try {
      const res = await fetch(`${API_URL}/menu`)
      if (res.ok) {
        const data = await res.json()
        setMenuItems(Array.isArray(data) ? data : [])
      }
    } catch (e) {
      console.error('Failed to fetch menu items:', e)
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`)
      if (res.ok) {
        const data = await res.json()
        setOrders(Array.isArray(data) ? data : [])
      }
    } catch (e) {
      console.error('Failed to fetch orders:', e)
    }
  }

  const handleAddMenuItem = async (e) => {
    e.preventDefault()
    if (!menuForm.name || !menuForm.price) return
    try {
      const res = await fetch(`${API_URL}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...menuForm,
          price: parseFloat(menuForm.price)
        })
      })
      if (res.ok) {
        setMenuForm({ name: '', category: 'Pizza', price: '', description: '' })
        fetchMenuItems()
        setNotification({ type: 'success', text: '✅ Menu item added!' })
      }
    } catch (e) {
      setNotification({ type: 'error', text: '❌ Failed to add item' })
    }
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!orderForm.menuItemId || !orderForm.quantity) return
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderForm,
          quantity: parseInt(orderForm.quantity)
        })
      })
      if (res.ok) {
        setOrderForm({ menuItemId: '', quantity: '1', cashier: '' })
        fetchOrders()
        setNotification({ type: 'success', text: '✅ Order placed successfully!' })
      }
    } catch (e) {
      setNotification({ type: 'error', text: '❌ Failed to place order' })
    }
  }

  const categories = ['Pizza', 'Burger', 'Sprite', 'Coke', 'IceCream', 'Chips']
  const categoryEmojis = {
    Pizza: '🍕', Burger: '🍔', Sprite: '🥤', Coke: '🥤',
    IceCream: '🍦', Chips: '🍟'
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🍕 Deboneirs Inn System</h1>
        <p className="subtitle">
          Modernized from Legacy VB6 → React + Express
          <span style={{
            display: 'inline-block',
            marginLeft: '16px',
            padding: '4px 14px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 600,
            background: status?.success
              ? 'rgba(0, 184, 148, 0.2)'
              : 'rgba(255, 71, 87, 0.2)',
            color: status?.success ? '#00b894' : '#ff4757',
            border: `1px solid ${status?.success ? 'rgba(0,184,148,0.3)' : 'rgba(255,71,87,0.3)'}`
          }}>
            {status?.success ? '● Online' : '● Offline'}
          </span>
        </p>
      </header>

      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 1000,
          padding: '16px 24px', borderRadius: '16px',
          background: notification.type === 'success'
            ? 'rgba(0, 184, 148, 0.95)' : 'rgba(255, 71, 87, 0.95)',
          color: '#fff', fontWeight: 600, fontSize: '0.95rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          animation: 'slideIn 0.3s ease'
        }}>
          {notification.text}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '30px',
        justifyContent: 'center'
      }}>
        {[
          { id: 'menu', label: '📋 Menu Management' },
          { id: 'orders', label: '🛒 Orders' },
          { id: 'dashboard', label: '📊 Dashboard' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id
                ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
              border: activeTab === tab.id
                ? 'none' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: activeTab === tab.id
                ? '0 4px 15px var(--primary-glow)' : 'none',
              padding: '12px 28px',
              fontSize: '0.95rem'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MENU MANAGEMENT TAB */}
      {activeTab === 'menu' && (
        <div className="grid-container">
          <div className="card">
            <h2>Add Menu Item</h2>
            <form onSubmit={handleAddMenuItem} className="modern-form">
              <input
                placeholder="Item Name (e.g. Margherita Pizza)"
                value={menuForm.name}
                onChange={e => setMenuForm({ ...menuForm, name: e.target.value })}
                required
              />
              <select
                value={menuForm.category}
                onChange={e => setMenuForm({ ...menuForm, category: e.target.value })}
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', padding: '14px 18px',
                  color: 'var(--text-main)', fontFamily: 'inherit',
                  fontSize: '1rem', cursor: 'pointer'
                }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{categoryEmojis[cat]} {cat}</option>
                ))}
              </select>
              <input
                placeholder="Price (e.g. 350)"
                type="number"
                step="0.01"
                value={menuForm.price}
                onChange={e => setMenuForm({ ...menuForm, price: e.target.value })}
                required
              />
              <input
                placeholder="Description (optional)"
                value={menuForm.description}
                onChange={e => setMenuForm({ ...menuForm, description: e.target.value })}
              />
              <button type="submit" className="btn-primary">
                + Add to Menu
              </button>
            </form>
          </div>

          <div className="card">
            <h2>Current Menu ({menuItems.length})</h2>
            <div className="list-section">
              {menuItems.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
                  No menu items yet. Add some from the form!
                </p>
              ) : (
                <ul>
                  {menuItems.map((item, i) => (
                    <li key={item.id || i}>
                      <div>
                        <strong>{categoryEmojis[item.category] || '🍽️'} {item.name}</strong>
                        <br />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {item.category} {item.description ? `• ${item.description}` : ''}
                        </span>
                      </div>
                      <span style={{
                        color: 'var(--success)', fontWeight: 700,
                        fontSize: '1.1rem'
                      }}>
                        R{parseFloat(item.price || 0).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="grid-container">
          <div className="card">
            <h2>Place New Order</h2>
            <form onSubmit={handlePlaceOrder} className="modern-form">
              <select
                value={orderForm.menuItemId}
                onChange={e => setOrderForm({ ...orderForm, menuItemId: e.target.value })}
                required
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', padding: '14px 18px',
                  color: 'var(--text-main)', fontFamily: 'inherit',
                  fontSize: '1rem', cursor: 'pointer'
                }}
              >
                <option value="">Select menu item...</option>
                {menuItems.map((item, i) => (
                  <option key={item.id || i} value={item.id || i}>
                    {categoryEmojis[item.category]} {item.name} — R{parseFloat(item.price || 0).toFixed(2)}
                  </option>
                ))}
              </select>
              <input
                placeholder="Quantity"
                type="number"
                min="1"
                value={orderForm.quantity}
                onChange={e => setOrderForm({ ...orderForm, quantity: e.target.value })}
                required
              />
              <input
                placeholder="Cashier Name"
                value={orderForm.cashier}
                onChange={e => setOrderForm({ ...orderForm, cashier: e.target.value })}
              />
              <button type="submit" className="btn-success">
                🛒 Place Order
              </button>
            </form>
          </div>

          <div className="card">
            <h2>Recent Orders ({orders.length})</h2>
            <div className="list-section">
              {orders.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
                  No orders yet. Place one from the form!
                </p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Qty</th>
                      <th>Cashier</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, i) => (
                      <tr key={order.id || i}>
                        <td>{order.menuItemName || `Order #${order.id}`}</td>
                        <td>{order.quantity}</td>
                        <td>{order.cashier || '—'}</td>
                        <td>
                          <span style={{
                            padding: '4px 12px', borderRadius: '12px',
                            fontSize: '0.8rem', fontWeight: 600,
                            background: 'rgba(0,184,148,0.15)',
                            color: 'var(--success)',
                            border: '1px solid rgba(0,184,148,0.2)'
                          }}>
                            {order.status || 'Completed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div>
          <div className="grid-container" style={{ marginBottom: '30px' }}>
            {[
              { label: 'Menu Items', value: menuItems.length, icon: '📋', color: 'var(--primary)' },
              { label: 'Total Orders', value: orders.length, icon: '🛒', color: 'var(--success)' },
              { label: 'Categories', value: [...new Set(menuItems.map(i => i.category))].length, icon: '📂', color: '#e17055' },
              { label: 'Revenue', value: `R${orders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0).toFixed(2)}`, icon: '💰', color: '#fdcb6e' }
            ].map((stat, i) => (
              <div key={i} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{stat.icon}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: stat.color }}>
                  {stat.value}
                </div>
                <div style={{ color: 'var(--text-muted)', marginTop: '5px' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Category Breakdown */}
          <div className="card">
            <h2>Menu by Category</h2>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '10px' }}>
              {categories.map(cat => {
                const count = menuItems.filter(i => i.category === cat).length
                return (
                  <div key={cat} style={{
                    flex: '1 1 140px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px', padding: '20px',
                    textAlign: 'center',
                    transition: 'transform 0.2s ease'
                  }}>
                    <div style={{ fontSize: '2rem' }}>{categoryEmojis[cat]}</div>
                    <div style={{ fontWeight: 600, marginTop: '8px' }}>{cat}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {count} item{count !== 1 ? 's' : ''}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        select option {
          background: #1a1a2e;
          color: #f5f6fa;
        }
      `}</style>
    </div>
  )
}

export default App