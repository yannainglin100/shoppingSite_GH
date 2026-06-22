const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5002;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const initDb = async () => {
  try {
    //await pool.query(`DROP TABLE IF EXISTS products CASCADE;`);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        img_url TEXT NOT NULL,
        stock INT NOT NULL
      );
    `);
    console.log("PostgreSQL Products schema verified successfully.");
  } catch (err) { 
    console.error("Products table initiation failed, retrying...", err);
    setTimeout(initDb, 3000);
  }
};
initDb();

app.use('/api/catalog/admin', require('./admin/adminCatalog')(pool));
app.use('/api/catalog/user', require('./user/userCatalog')(pool));

app.listen(PORT, () => console.log(`Catalog Relational Service operational on port ${PORT}`));