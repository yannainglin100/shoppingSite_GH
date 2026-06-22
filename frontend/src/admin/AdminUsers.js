import React, { useState } from 'react';

export default function AdminUsers({ users, authUrl, refresh }) {
  const [search, setSearch] = useState('');

  const purgeUser = async (id) => {
    if (window.confirm("Revoke access and delete this user profile account?")) {
      await fetch(`${authUrl}/users/${id}`, { method: 'DELETE' });
      refresh();
    }
  };

  const recordsFiltered = users.filter(u => u.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={userStyles.container}>
      <h2 style={userStyles.title}>User Registry Database Console</h2>
      
      <div style={userStyles.searchBarRow}>
        <input 
          type="text" 
          placeholder="🔍 Search system users dynamically..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          style={userStyles.searchBar} 
        />
      </div>

      <div style={userStyles.tableCard}>
        <table style={userStyles.table}>
          <thead>
            <tr style={userStyles.headerRow}>
              <th style={userStyles.th}>Database Identifier</th>
              <th style={userStyles.th}>Account Profile Username</th>
              <th style={userStyles.th}>Assigned Operational Role</th>
              <th style={userStyles.thCenter}>Administrative Safeguard Actions</th>
            </tr>
          </thead>
          <tbody>
            {recordsFiltered.length > 0 ? (
              recordsFiltered.map(u => (
                <tr key={u.id} style={userStyles.bodyRow}>
                  <td style={userStyles.tdId}>USR-{u.id}</td>
                  <td style={userStyles.tdName}>{u.username}</td>
                  <td style={userStyles.tdRole}>
                    <span style={u.role === 'admin' ? userStyles.adminBadge : userStyles.userBadge}>
                      {u.role || 'user'}
                    </span>
                  </td>
                  <td style={userStyles.tdCenter}>
                    {u.username !== 'admin' ? (
                      <button onClick={() => purgeUser(u.id)} style={userStyles.revokeBtn}>
                        Revoke Token Keys
                      </button>
                    ) : (
                      <span style={userStyles.systemLockedText}>🔒 Base System Root</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={userStyles.noDataCell}>No matched identities located inside system cluster storage records.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const userStyles = {
  container: { fontFamily: 'sans-serif' },
  title: { color: '#0369a1', fontSize: '1.5rem', marginBottom: '20px', fontWeight: '700' },
  searchBarRow: { marginBottom: '20px' },
  searchBar: { padding: '12px 16px', width: '100%', maxWidth: '360px', borderRadius: '8px', border: '2px solid #bae6fd', backgroundColor: '#ffffff', outline: 'none', fontSize: '0.95rem' },
  tableCard: { backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e0f2fe', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.04)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' },
  headerRow: { backgroundColor: '#e0f2fe' },
  th: { padding: '14px 16px', color: '#0369a1', fontWeight: '600', borderBottom: '2px solid #bae6fd' },
  thCenter: { padding: '14px 16px', color: '#0369a1', fontWeight: '600', borderBottom: '2px solid #bae6fd', textAlign: 'center' },
  bodyRow: { borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' },
  tdId: { padding: '14px 16px', color: '#64748b', fontFamily: 'monospace' },
  tdName: { padding: '14px 16px', fontWeight: '600', color: '#1e293b' },
  tdRole: { padding: '14px 16px' },
  tdCenter: { padding: '14px 16px', textAlign: 'center' },
  adminBadge: { backgroundColor: '#0284c7', color: '#ffffff', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' },
  userBadge: { backgroundColor: '#f0f9ff', color: '#0369a1', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600', border: '1px solid #bae6fd' },
  revokeBtn: { backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: '0.2s' },
  systemLockedText: { color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' },
  noDataCell: { padding: '30px', textAlign: 'center', color: '#64748b' }
};