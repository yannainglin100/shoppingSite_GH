const express = require('express');

module.exports = function(pool) {
  const router = express.Router();
  
  // 1. ADD PRODUCT (POST)
  router.post('/products', async (req, res) => {
    try {
      const { title, price, imgUrl, stock } = req.body;
      const result = await pool.query(
        'INSERT INTO products (title, price, img_url, stock) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, price, imgUrl, stock]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Create product failed:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 2. MODIFY/UPDATE PRODUCT (PUT) - This is where the duplicate fix happens!
  router.put('/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, price, imgUrl, stock } = req.body;

      const result = await pool.query(
        'UPDATE products SET title=$1, price=$2, img_url=$3, stock=$4 WHERE id=$5 RETURNING *',
        [title, price, imgUrl, stock, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Product not located in database" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Update product failed:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 3. PURGE/DELETE PRODUCT (DELETE) - This fixes the unclickable/non-responsive delete button!
  router.delete('/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Product already missing or deleted" });
      }

      res.json({ message: "Purged from relational storage catalog successfully" });
    } catch (err) {
      console.error("Delete product failed:", err);
      res.status(500).json({ error: err.message });
    }
  });

  router.patch('/products/:id/stock', async (req, res) => {
    const { id } = req.params;
    const { quantityChange } = req.body; // Can be negative (deduct) or positive (refund)
    
    try {
      // Begin a transaction block to prevent concurrent race conditions
      await pool.query('BEGIN');
      
      const productCheck = await pool.query('SELECT stock, title FROM products WHERE id = $1 FOR UPDATE', [id]);
      if (productCheck.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ error: "Product not found" });
      }

      const currentStock = productCheck.rows[0].stock;
      const newStock = currentStock + quantityChange;

      if (newStock < 0) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ error: `Insufficient stock for "${productCheck.rows[0].title}". Available: ${currentStock}` });
      }

      const result = await pool.query(
        'UPDATE products SET stock = $1 WHERE id = $2 RETURNING *',
        [newStock, id]
      );

      await pool.query('COMMIT');
      res.json(result.rows[0]);
    } catch (err) {
      await pool.query('ROLLBACK');
      console.error("Stock mutation error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};