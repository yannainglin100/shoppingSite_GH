import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminOrders from './admin/AdminOrders'; // New panel import
import AdminUsers from './admin/AdminUsers';
import UserStore from './user/UserStore';
import UserCart from './user/UserCart';
import UserOrders from './user/UserOrders';

const AUTH_URL = process.env.REACT_APP_AUTH_URL || 'http://localhost:5001/api/auth';
const CATALOG_URL = process.env.REACT_APP_CATALOG_URL || 'http://localhost:5002/api/catalog';
const ORDER_URL = process.env.REACT_APP_ORDER_URL || 'http://localhost:5003/api/order';

function App() {
  const [view, setView] = useState('login');
  const [username, setUsername] = useState('');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [cart, setCart] = useState([]);
  const [msg, setMsg] = useState('');

  const syncAppLayers = async () => {
    try {
      const resP = await fetch(`${CATALOG_URL}/user/products`); 
      setProducts(await resP.json());
      
      if (username === 'admin') {
        const resU = await fetch(`${AUTH_URL}/users`); setUsers(await resU.json());
        const resO = await fetch(`${ORDER_URL}/admin/metrics`); setOrders(await resO.json());
      } else {
        const resO = await fetch(`${ORDER_URL}/user/history/${username}`); setOrders(await resO.json());
      }
    } catch (e) { console.error("Sync error:", e); }
  };

  useEffect(() => { 
    if (view !== 'login' && view !== 'signup') syncAppLayers(); 
  }, [view]);

  const navStyle = { display: 'flex', gap: '25px', backgroundColor: '#0369a1', padding: '20px 40px', color: '#fff', alignItems: 'center' };
  const tabBtn = { background: 'none', border: 'none', color: '#e0f2fe', cursor: 'pointer', fontWeight: '600', fontSize: '15px' };

  if (view === 'login' || view === 'signup') {
    return (
      <AuthPage authUrl={AUTH_URL} setView={setView} setUsername={setUsername} setMsg={setMsg} msg={msg} />
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', margin: 0, backgroundColor: '#f0f9ff', minHeight: '100vh' }}>
      <nav style={navStyle}>
        <h3 style={{ margin: 0 }}>🛍️ shoppingSite</h3>
        {username === 'admin' ? (
          <>
            <button style={tabBtn} onClick={() => setView('adminDash')}>Analytics Dashboard</button>
            <button style={tabBtn} onClick={() => setView('adminProducts')}>Manage Products</button>
            <button style={tabBtn} onClick={() => setView('adminOrders')}>Manage Orders</button>
            <button style={tabBtn} onClick={() => setView('adminUsers')}>Users Registry</button>
          </>
        ) : (
          <>
            <button style={tabBtn} onClick={() => setView('userStore')}>Storefront Collection</button>
            <button style={tabBtn} onClick={() => setView('userCart')}>My Bag Cart ({cart.length})</button>
            <button style={tabBtn} onClick={() => setView('userOrders')}>My History Ledger</button>
          </>
        )}
        <button style={{ ...tabBtn, marginLeft: 'auto', color: '#fca5a5' }} onClick={() => { setView('login'); setUsername(''); setCart([]); setMsg(''); }}>Logout Session</button>
      </nav>

      <div style={{ padding: '40px' }}>
        {view === 'adminDash' && <AdminDashboard orders={orders} orderUrl={ORDER_URL} refresh={syncAppLayers} />}
        {view === 'adminProducts' && <AdminProducts products={products} catalogUrl={CATALOG_URL} refresh={syncAppLayers} />}
        {view === 'adminOrders' && <AdminOrders orders={orders} orderUrl={ORDER_URL} refresh={syncAppLayers} />}
        {view === 'adminUsers' && <AdminUsers users={users} authUrl={AUTH_URL} refresh={syncAppLayers} />}
        {view === 'userStore' && <UserStore products={products} cart={cart} setCart={setCart} />}
        {view === 'userCart' && <UserCart cart={cart} setCart={setCart} username={username} orderUrl={ORDER_URL} setView={setView} />}
        {view === 'userOrders' && <UserOrders orders={orders} />}
      </div>
    </div>
  );
}

export default App;