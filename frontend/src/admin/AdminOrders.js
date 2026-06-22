import React, { useState } from 'react';

export default function AdminOrders({ orders, orderUrl, refresh }) {
  const [filterStatus, setFilterStatus] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const updateStatus = async (id, status) => {
    await fetch(`${orderUrl}/admin/process/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setExpandedId(null);
    refresh();
  };

  const filtered = orders.filter(o => filterStatus === 'All' || o.status === filterStatus);

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#0369a1', margin: 0 }}>Global Orders Management Ledger</h2>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '2px solid #bae6fd', color: '#0369a1', fontWeight: '600' }}>
          <option value="All">All Transactions</option>
          <option value="Pending">Pending Queue</option>
          <option value="Accepted">Accepted Purchases</option>
          <option value="Rejected">Rejected Returns</option>
        </select>
      </div>

      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e0f2fe', overflow: 'hidden', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
              <th style={{ padding: '14px 16px' }}>Order ID</th>
              <th style={{ padding: '14px 16px' }}>Account</th>
              <th style={{ padding: '14px 16px' }}>Consignee Details</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Distinct Items</th>
              <th style={{ padding: '14px 16px' }}>Status</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => {
              const totalItemsCount = (o.items || []).reduce((total, i) => total + i.quantity, 0);
              return (
                <React.Fragment key={o.id}>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace' }}>ORD-{o.id}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '600' }}>{o.username}</td>
                    <td style={{ padding: '14px 16px', fontSize: '0.85rem' }}>{o.customer_name} ({o.phone})</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>{totalItemsCount}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ backgroundColor: o.status === 'Accepted' ? '#dcfce7' : o.status === 'Rejected' ? '#fee2e2' : '#fef3c7', color: o.status === 'Accepted' ? '#15803d' : o.status === 'Rejected' ? '#b91c1c' : '#b45309', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '600' }}>{o.status}</span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <button onClick={() => setExpandedId(expandedId === o.id ? null : o.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>👁️</button>
                    </td>
                  </tr>
                  
                  {/* Embedded Detail Slider Row */}
                  {expandedId === o.id && (
                    <tr>
                      <td colSpan="6" style={{ backgroundColor: '#f8fafc', padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
                        <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e0f2fe' }}>
                          <p style={{ margin: '0 0 10px 0', fontSize: '0.9rem' }}><strong>Shipping Destination Landmark:</strong> {o.address}</p>
                          <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ color: '#0369a1', borderBottom: '2px solid #edf2f7', textAlign: 'left' }}>
                                <th style={{ padding: '6px 0' }}>Product Manifest Line</th>
                                <th>Unit Price</th>
                                <th>Qty</th>
                                <th style={{ textAlign: 'right' }}>Aggregate</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(o.items || []).map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '8px 0' }}>{item.title}</td>
                                  <td>${parseFloat(item.price).toFixed(2)}</td>
                                  <td>{item.quantity}</td>
                                  <td style={{ textAlign: 'right', fontWeight: '600' }}>${(item.price * item.quantity).toFixed(2)}</td>
                                \n                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {o.status === 'Pending' && (
                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'flex-end' }}>
                              <button onClick={() => updateStatus(o.id, 'Accepted')} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Accept Order</button>
                              <button onClick={() => updateStatus(o.id, 'Rejected')} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Reject Order</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}