const express = require('express');

module.exports = function(pool) {
  const router = express.Router();

  // Get all inventory options for storefront visibility
  router.get('/products', async (req, res) => {
    try {
      const result = await pool.query('SELECT id, title, price, img_url, stock FROM products ORDER BY id DESC');
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};