import React, { useState } from 'react';

export default function AdminProducts({ products, catalogUrl, refresh }) {
  const [form, setForm] = useState({ title: '', price: '', stock: '', imgUrl: '' });
  const [editingId, setEditingId] = useState(null);

  const commitProduct = async (e) => {
    e.preventDefault();
    
    // Explicitly point to /products/:id when editing, otherwise hit /products
    const endpoint = editingId 
      ? `${catalogUrl}/admin/products/${editingId}` 
      : `${catalogUrl}/admin/products`;
    const method = editingId ? 'PUT' : 'POST';

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (response.ok) {
      setForm({ title: '', price: '', stock: '', imgUrl: '' });
      setEditingId(null);
      refresh(); // Pull clean database states down instantly
    }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({ 
      title: p.title, 
      price: p.price, 
      stock: p.stock, 
      imgUrl: p.img_url || p.imgUrl 
    });
  };

  const deleteProduct = async (id) => {
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this product?")) {
      const response = await fetch(`${catalogUrl}/admin/products/${id}`, { method: 'DELETE' });
      if (response.ok) {
        refresh(); // Refresh state so the component disappears from view
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>{editingId ? '🔄 Update Product Listing' : '✨ Add New Product Entry'}</h3>
        <form onSubmit={commitProduct} style={styles.formGrid}>
          <div style={styles.inputWrapper}>
            <input type="text" placeholder="Product Title Name" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={styles.input} />
            <input type="number" step="0.01" placeholder="Price ($)" value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || '' })} required style={styles.input} />
            <input type="number" placeholder="Available Stock" value={form.stock} onChange={e => setForm({ ...form, stock: parseInt(e.target.value) || '' })} required style={styles.input} />
            <input type="text" placeholder="ImageKit Asset URL Link" value={form.imgUrl} onChange={e => setForm({ ...form, imgUrl: e.target.value })} required style={styles.input} />
          </div>

          <div style={styles.previewContainer}>
            <span style={styles.previewLabel}>Asset Mirror Preview:</span>
            <div style={styles.imageBox}>
              {form.imgUrl ? (
                <img src={form.imgUrl} alt="Preview" style={styles.previewImg} onError={(e) => { e.target.src = 'https://placehold.co/120?text=Invalid+Image'; }} />
              ) : (
                <span style={styles.placeholderText}>Awaiting Link...</span>
              )}
            </div>
          </div>

          <div style={styles.actionRow}>
            <button type="submit" style={styles.publishBtn}>{editingId ? 'Save Changes' : 'Publish Entry'}</button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm({ title: '', price: '', stock: '', imgUrl: '' }); }} style={styles.cancelBtn}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <h3 style={styles.sectionTitle}>Current Inventory Matrix</h3>
      <div style={styles.grid}>
        {products.map(p => (
          <div key={p.id} style={styles.productCard}>
            <img src={p.img_url || p.imgUrl} alt={p.title} style={styles.catalogImg} />
            <div style={styles.productDetails}>
              <h4 style={styles.productTitle}>{p.title}</h4>
              <p style={styles.productPrice}>Price: <span>${parseFloat(p.price).toFixed(2)}</span></p>
              <p style={styles.productStock}>In Stock: <strong>{p.stock} units</strong></p>
            </div>
            <div style={styles.buttonGroup}>
              <button onClick={() => startEdit(p)} style={styles.editBtn}>Modify</button>
              <button onClick={() => deleteProduct(p.id)} style={styles.deleteBtn}>Purge</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: 'sans-serif' },
  card: { backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(2, 132, 199, 0.08)', marginBottom: '35px', border: '1px solid #e0f2fe' },
  cardTitle: { margin: '0 0 20px 0', color: '#0369a1', fontSize: '1.25rem' },
  formGrid: { display: 'flex', flexWrap: 'wrap', gap: '20px' },
  inputWrapper: { display: 'flex', flexDirection: 'column', gap: '12px', flex: '2 1 300px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #bae6fd', fontSize: '0.95rem', backgroundColor: '#f8fafc', outline: 'none' },
  previewContainer: { display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 120px', alignItems: 'center', justifyContent: 'center', minWidth: '140px' },
  previewLabel: { fontSize: '0.8rem', color: '#0369a1', fontWeight: '600' },
  imageBox: { width: '120px', height: '120px', borderRadius: '8px', border: '2px dashed #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f9ff', overflow: 'hidden' },
  previewImg: { width: '100%', height: '100%', objectFit: 'cover' },
  placeholderText: { fontSize: '0.75rem', color: '#64748b', textAlign: 'center' },
  actionRow: { width: '100%', display: 'flex', gap: '10px' },
  publishBtn: { backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  cancelBtn: { backgroundColor: '#64748b', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  sectionTitle: { color: '#0369a1', marginBottom: '20px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  productCard: { backgroundColor: '#ffffff', border: '1px solid #e0f2fe', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
  catalogImg: { width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#f8fafc' },
  productDetails: { flexGrow: 1 },
  productTitle: { margin: '0 0 8px 0', color: '#1e293b', fontSize: '1.1rem' },
  productPrice: { margin: '0 0 4px 0', color: '#64748b', fontSize: '0.9rem' },
  productStock: { margin: '0', color: '#64748b', fontSize: '0.9rem' },
  buttonGroup: { display: 'flex', gap: '10px', marginTop: '10px' },
  editBtn: { flex: 1, backgroundColor: '#e0f2fe', color: '#0369a1', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  deleteBtn: { flex: 1, backgroundColor: '#fef2f2', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }
};