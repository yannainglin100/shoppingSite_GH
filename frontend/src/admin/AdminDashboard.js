import React, { useState } from 'react';

export default function AdminDashboard({ orders, orderUrl, refresh }) {
  const [activeDetails, setActiveDetails] = useState(null);
  const pendingOrders = orders.filter(o => o.status === 'Pending');

  // --- BUSINESS METRICS CALCULATIONS ---
  const totalOrdersCount = orders.length;
  
  // Total Revenue: Value of all Accepted Orders
  const totalRevenue = orders
    .filter(o => o.status === 'Accepted')
    .reduce((sum, o) => sum + (o.items || []).reduce((iSum, i) => iSum + (parseFloat(i.price) * i.quantity), 0), 0);

  // Projected Value: Value of Pending Orders currently floating in the pipeline
  const pendingPipelineValue = orders
    .filter(o => o.status === 'Pending')
    .reduce((sum, o) => sum + (o.items || []).reduce((iSum, i) => iSum + (parseFloat(i.price) * i.quantity), 0), 0);

  // Total Items Dispatched across approved sales channels
  const unitsSold = orders
    .filter(o => o.status === 'Accepted')
    .reduce((sum, o) => sum + (o.items || []).reduce((iSum, i) => iSum + i.quantity, 0), 0);

  const updateStatus = async (id, status) => {
    await fetch(`${orderUrl}/admin/process/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setActiveDetails(null);
    refresh();
  };

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#ed292f', marginBottom: '25px', fontWeight: '701' }}>Executive Business Summary Dashboard</h2>
      
      {/* BUSINESS METRICS SUMMARY MATRIX GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={metricCardStyle('#f0fdf5', '#16a34a', '#bbf7d0')}>
          <h4>Gross Realized Revenue</h4>
          <p>${totalRevenue.toFixed(2)}</p>
          <span>From approved transactions</span>
        </div>
        <div style={metricCardStyle('#fffbeb', '#d97706', '#fef3c7')}>
          <h4>Pending Pipeline Value</h4>
          <p>${pendingPipelineValue.toFixed(2)}</p>
          <span>Awaiting administrative review</span>
        </div>
        <div style={metricCardStyle('#f0f9ff', '#0284c7', '#bae6fd')}>
          <h4>Total Units Dispatched</h4>
          <p>{unitsSold} Units</p>
          <span>Shipped to customer destinations</span>
        </div>
        <div style={metricCardStyle('#fafafa', '#525252', '#e5e5e5')}>
          <h4>Total Order Records</h4>
          <p>{totalOrdersCount} Checkouts</p>
          <span>Lifetime transaction footprint</span>
        </div>
      </div>

      <h3 style={{ color: '#0369a1', marginBottom: '20px', fontWeight: '600' }}>⚠️ Action Required: Pending Verification Queue</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {pendingOrders.length > 0 ? (
          pendingOrders.map(o => {
            const orderTotal = (o.items || []).reduce((sum, i) => sum + (parseFloat(i.price) * i.quantity), 0);
            return (
              <div key={o.id} style={{ display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #e0f2fe', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.01)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Order <strong>ORD-{o.id}</strong> by <strong>{o.username}</strong> ── Total Value: <strong>${orderTotal.toFixed(2)}</strong></span>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button onClick={() => setActiveDetails(activeDetails === o.id ? null : o.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }} title="View Details">👁️</button>
                    <button style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }} onClick={() => updateStatus(o.id, 'Accepted')}>Accept</button>
                    <button style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }} onClick={() => updateStatus(o.id, 'Rejected')}>Reject</button>
                  </div>
                </div>

                {activeDetails === o.id && (
                  <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px dashed #bae6fd' }}>
                    <h5 style={{ margin: '0 0 10px 0', color: '#0369a1' }}>📦 Shipping Logistics Payload:</h5>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#334155' }}><strong>Customer:</strong> {o.customer_name} | <strong>Phone:</strong> {o.phone} <br /><strong>Address:</strong> {o.address}</p>
                    <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ textAlign: 'left', color: '#0369a1' }}>
                          <th style={{ paddingBottom: '6px' }}>Item Name</th>
                          <th>Unit Price</th>
                          <th>Qty</th>
                          <th style={{ textAlign: 'right' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(o.items || []).map(item => (
                          <tr key={item.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '8px 0' }}>{item.title}</td>
                            <td>${parseFloat(item.price).toFixed(2)}</td>
                            <td>{item.quantity}</td>
                            <td style={{ textAlign: 'right', fontWeight: '600' }}>${(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p style={{ color: '#64748b', fontStyle: 'italic' }}>No customer checkouts currently pending verification.</p>
        )}
      </div>
    </div>
  );
}

const metricCardStyle = (bg, text, border) => ({
  backgroundColor: bg,
  color: text,
  border: `1px solid ${border}`,
  padding: '20px',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.01)',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  h4: { margin: 0, fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.8 },
  p: { margin: 0, fontSize: '2rem', fontWeight: '700' },
  span: { fontSize: '0.75rem', opacity: 0.7, marginTop: '4px' }
});