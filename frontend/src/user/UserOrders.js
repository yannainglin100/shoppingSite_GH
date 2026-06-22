import React, { useState } from 'react';

export default function UserOrders({ orders }) {
  const [viewId, setViewId] = useState(null);

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h3 style={{ color: '#0369a1', marginBottom: '20px', fontWeight: '700' }}>Your Purchases Verification History Ledger</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {orders.length > 0 ? (
          orders.map(o => {
            const totalPrice = (o.items || []).reduce((acc, i) => acc + (i.price * i.quantity), 0);
            return (
              <div key={o.id} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e0f2fe', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', color: '#1e293b' }}>Receipt #ORD-{o.id}</span>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Value: ${totalPrice.toFixed(2)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span style={{ backgroundColor: o.status === 'Accepted' ? '#dcfce7' : o.status === 'Rejected' ? '#fee2e2' : '#fef3c7', color: o.status === 'Accepted' ? '#15803d' : o.status === 'Rejected' ? '#b91c1c' : '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>{o.status}</span>
                    <button onClick={() => setViewId(viewId === o.id ? null : o.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>👁️</button>
                  </div>
                </div>

                {viewId === o.id && (
                  <div style={{ marginTop: '15px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', borderTop: '2px solid #e0f2fe' }}>
                    <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '8px' }}><strong>Ship to:</strong> {o.customer_name} ({o.phone}) <br /><strong>Address:</strong> {o.address}</div>
                    {o.items.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '4px 0', borderBottom: '1px dashed #e2e8f0' }}>
                        <span>{item.title} (x{item.quantity})</span>
                        <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : <p style={{ color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>No orders found.</p>}
      </div>
    </div>
  );
}