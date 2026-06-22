const express = require('express');

module.exports = function(pool) {
  const router = express.Router();
  const CATALOG_INTERNAL_URL = process.env.CATALOG_INTERNAL_URL || 'http://localhost:5002/api/catalog/admin';
  
  router.get('/metrics', async (req, res) => {
    try {
      const ordersRes = await pool.query('SELECT id, username, customer_name, phone, address, status FROM orders ORDER BY id DESC');
      const comprehensiveOrders = [];
      for (let order of ordersRes.rows) {
        const itemsRes = await pool.query('SELECT id, product_id, title, price, quantity FROM order_items WHERE order_id = $1', [order.id]);
        comprehensiveOrders.push({ ...order, items: itemsRes.rows });
      }
      res.json(comprehensiveOrders);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  router.put('/process/:id', async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    try {
      await pool.query('BEGIN');

      // 1. Fetch current verification status before applying updates
      const currentOrderCheck = await pool.query('SELECT status FROM orders WHERE id = $1 FOR UPDATE', [id]);
      if (currentOrderCheck.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ error: "Order context missing" });
      }

      const previousStatus = currentOrderCheck.rows[0].status;

      // 2. Commit status change
      const updateResult = await pool.query(
        'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, username, status',
        [status, id]
      );

      // 3. IF status changed to REJECTED from PENDING, refund inventory stock back
      if (status === 'Rejected' && previousStatus === 'Pending') {
        const itemsRes = await pool.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [id]);
        
        for (let item of itemsRes.rows) {
          await fetch(`${CATALOG_INTERNAL_URL}/products/${item.product_id}/stock`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantityChange: item.quantity }) // Positive value to refund stock
          });
        }
      }

      await pool.query('COMMIT');
      res.json(updateResult.rows[0]);
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error("Order processing error:", err);
      res.status(500).json({ error: err.message });
    }
  });
  
  return router;
};