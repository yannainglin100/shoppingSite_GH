import React, { useState } from 'react';

export default function UserCart({ cart, setCart, username, orderUrl, setView }) {
  const [shipping, setShipping] = useState({ customerName: '', phone: '', address: '' });
  const [errorMessage, setErrorMessage] = useState('');

  const updateQuantity = (productId, amount) => {
    setCart(cart.map(item => item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item));
  };

  const removeItem = (productId) => setCart(cart.filter(item => item.id !== productId));
  const totalPrice = cart.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);

  const processCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setErrorMessage('');

    const payload = {
      username,
      customerName: shipping.customerName,
      phone: shipping.phone,
      address: shipping.address,
      items: cart.map(i => ({ id: i.id, title: i.title, price: i.price, quantity: i.quantity }))
    };

    try {
      const response = await fetch(`${orderUrl}/user/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Inventory processing exception occurred.");
      }

      setCart([]);
      setShipping({ customerName: '', phone: '', address: '' });
      setView('userOrders');
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto', backgroundColor: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #e0f2fe' }}>
      <h3 style={{ color: '#0369a1', margin: '0 0 20px 0', fontWeight: '700' }}>Your Bag Cart Items Selection</h3>
      
      {/* Dynamic Inventory Alert Banner */}
      {errorMessage && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem', fontWeight: '600' }}>
          ⚠️ {errorMessage}
        </div>
      )}

      {cart.length > 0 ? (
        <>
          {cart.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div>
                <span style={{ fontWeight: '600' }}>{item.title}</span>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>${parseFloat(item.price).toFixed(2)} each</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button type="button" onClick={() => updateQuantity(item.id, -1)} style={{ width: '26px', height: '26px', borderRadius: '4px', border: '1px solid #bae6fd', backgroundColor: '#f0f9ff', cursor: 'pointer' }}>-</button>
                <span style={{ fontWeight: 'bold' }}>{item.quantity}</span>
                <button type="button" onClick={() => updateQuantity(item.id, 1)} style={{ width: '26px', height: '26px', borderRadius: '4px', border: '1px solid #bae6fd', backgroundColor: '#f0f9ff', cursor: 'pointer' }}>+</button>
              </div>
              <span style={{ fontWeight: '700', width: '80px', textAlign: 'right' }}>${(item.price * item.quantity).toFixed(2)}</span>
              <button type="button" onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px', marginTop: '15px', fontWeight: 'bold', color: '#0369a1' }}>
            <span>Total:</span><span>${totalPrice.toFixed(2)}</span>
          </div>
          <form onSubmit={processCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            <input type="text" placeholder="Recipient Full Name" value={shipping.customerName} onChange={e => setShipping({ ...shipping, customerName: e.target.value })} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bae6fd', outline: 'none' }} />
            <input type="tel" placeholder="Phone Number" value={shipping.phone} onChange={e => setShipping({ ...shipping, phone: e.target.value })} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bae6fd', outline: 'none' }} />
            <textarea placeholder="Delivery Address" value={shipping.address} onChange={e => setShipping({ ...shipping, address: e.target.value })} required rows="3" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #bae6fd', outline: 'none', resize: 'none' }} />
            <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Submit Order Placement</button>
          </form>
        </>
      ) : <p style={{ textAlign: 'center', color: '#64748b' }}>Your bag cart is currently empty.</p>}
    </div>
  );
}