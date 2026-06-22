import React, { useState, useEffect } from 'react';

const UserStore = ({ cart, setCart }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // FIX 1: Appended the missing /user route parameter segment to match backend mapping configurations
    fetch(process.env.REACT_APP_CATALOG_URL + '/user/products')
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Error fetching catalog items:", err));
  }, []);

  const addToCart = (product) => {
    const existingIndex = cart?.findIndex(item => item.id === product.id);
    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      setCart(updatedCart);
    } else {
      setCart([...(cart || []), { ...product, quantity: 1 }]);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Storefront Collection</h2>
      <div style={styles.grid}>
        {products.length > 0 ? (
          products.map(product => (
            <div key={product.id} style={styles.productCard}>
              <img 
                src={product.img_url} 
                alt={product.title} 
                style={styles.catalogImg} 
                onError={(e) => { e.target.src = 'https://placehold.co/200?text=No+Image'; }}
              />
              <div style={styles.productDetails}>
                {/* FIX 2: Swapped product.name to product.title to match the PostgreSQL column key */}
                <h4 style={styles.productTitle}>{product.title}</h4>
                <p style={styles.productPrice}>${parseFloat(product.price).toFixed(2)}</p>
                <p style={styles.productStock}>Available: {product.stock} units</p>
              </div>
              <button 
                onClick={() => addToCart(product)} 
                style={styles.cartBtn} 
                disabled={product.stock <= 0}
              >
                {product.stock > 0 ? '🛒 Add To Bag Cart' : 'Out of Stock'}
              </button>
            </div>
          ))
        ) : (
          <p style={styles.fallbackText}>No products currently available in the marketplace.</p>
        )}
      </div>
    </div>
  );
};

// Inline Clean Sky-Blue Styles Array Matrix matching the theme design guidelines
const styles = {
  container: { width: '100%', fontFamily: 'sans-serif' },
  title: { color: '#0369a1', marginBottom: '25px', fontWeight: '700' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '25px' },
  productCard: { backgroundColor: '#ffffff', border: '1px solid #e0f2fe', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 4px 10px rgba(2,132,199,0.02)' },
  catalogImg: { width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', backgroundColor: '#f8fafc' },
  productDetails: { display: 'flex', flexDirection: 'column', gap: '4px' },
  productTitle: { margin: 0, fontSize: '1.05rem', color: '#1e293b', fontWeight: '600' },
  productPrice: { margin: 0, fontSize: '1.15rem', color: '#0284c7', fontWeight: '700' },
  productStock: { margin: 0, fontSize: '0.85rem', color: '#64748b' },
  cartBtn: { backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '10px 0', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  fallbackText: { gridColumn: '1/-1', color: '#64748b', fontStyle: 'italic', textAlign: 'center', padding: '40px' }
};

export default UserStore;