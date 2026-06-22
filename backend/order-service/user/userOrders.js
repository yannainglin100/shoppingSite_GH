const express = require('express');

module.exports = function(pool) {
  const router = express.Router();
  const CATALOG_INTERNAL_URL = process.env.CATALOG_INTERNAL_URL || 'http://localhost:5002/api/catalog/admin';
  
  router.post('/checkout', async (req, res) => {
    const { username, customerName, phone, address, items } = req.body;
    const successfulDeductions = [];
    
    try {
      // Phase 1: Verify and deduct stock for each item in the catalog service
      for (let item of items) {
        const stockResponse = await fetch(`${CATALOG_INTERNAL_URL}/products/${item.id}/stock`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantityChange: -item.quantity }) // Negative value to deduct stock
        });

        const stockData = await stockResponse.json();

        if (!stockResponse.ok) {
          // If any single item fails stock validation, rollback previously deducted items
          for (let undo of successfulDeductions) {
            await fetch(`${CATALOG_INTERNAL_URL}/products/${undo.id}/stock`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ quantityChange: undo.quantity })
            });
          }
          return res.status(400).json({ error: stockData.error || "Inventory stock verification failed." });
        }
        
        // Track successful reductions in case we need to roll them back
        successfulDeductions.push({ id: item.id, quantity: item.quantity });
      }

      // Phase 2: Save the order metadata and items since stock is guaranteed
      await pool.query('BEGIN');

      const orderInsert = await pool.query(
        `INSERT INTO orders (username, customer_name, phone, address) 
         VALUES ($1, $2, $3, $4) RETURNING id, username, customer_name, phone, address, status`,
        [username, customerName, phone, address]
      );
      const newOrderId = orderInsert.rows[0].id;

      for (let item of items) {
        await pool.query(
          `INSERT INTO order_items (order_id, product_id, title, price, quantity) 
           VALUES ($1, $2, $3, $4, $5)`,
          [newOrderId, item.id, item.title, item.price, item.quantity]
        );
      }

      await pool.query('COMMIT');
      res.status(201).json(orderInsert.rows[0]);
    } catch (err) {
      await pool.query('ROLLBACK');
      // Fallback emergency inventory refund
      for (let undo of successfulDeductions) {
        await fetch(`${CATALOG_INTERNAL_URL}/products/${undo.id}/stock`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantityChange: undo.quantity })
        });
      }
      console.error("Checkout operation aborted:", err);
      res.status(500).json({ error: err.message });
    }
  });

  router.get('/history/:username', async (req, res) => {
    try {
      const ordersRes = await pool.query('SELECT id, username, customer_name, phone, address, status FROM orders WHERE username = $1 ORDER BY id DESC', [req.params.username]);
      const comprehensiveOrders = [];
      for (let order of ordersRes.rows) {
        const itemsRes = await pool.query('SELECT id, title, price, quantity FROM order_items WHERE order_id = $1', [order.id]);
        comprehensiveOrders.push({ ...order, items: itemsRes.rows });
      }
      res.json(comprehensiveOrders);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  return router;
};