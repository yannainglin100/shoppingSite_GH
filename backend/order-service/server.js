const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5003;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const initDb = async () => {
  try {
    //console.log("Dropping old table structure to rebuild One-to-Many relational schema...");
    //await pool.query(`DROP TABLE IF EXISTS order_items CASCADE;`);
    //await pool.query(`DROP TABLE IF EXISTS orders CASCADE;`);
    
    // 1. Create Parent Table (Stores distinct transaction data metadata)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        address TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending'
      );
    `);

    // 2. Create Child Table (Stores items belonging to a parent order)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        product_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        quantity INT NOT NULL
      );
    `);
    console.log("PostgreSQL Order and Order_Items structures mapped successfully.");
  } catch (err) { 
    console.error("Database initialization failed, retrying in 3s...", err);
    setTimeout(initDb, 3000); 
  }
};
initDb();

app.use('/api/order/admin', require('./admin/adminOrders')(pool));
app.use('/api/order/user', require('./user/userOrders')(pool));

app.listen(PORT, () => console.log(`Order SQL Transaction Processor running on port ${PORT}`));