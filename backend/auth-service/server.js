const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5001;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const initDb = async () => {
  try {
    //console.log("Executing force migration reset...");
    
    //await pool.query(`DROP TABLE IF EXISTS users CASCADE;`);
    //console.log("Success: Old table dropped from PostgreSQL memory.");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user'
      );
    `);
    console.log("Success: Fresh users table constructed with password column!");
  } catch (err) {
    console.error("Migration failed, retrying in 3 seconds...", err);
    setTimeout(initDb, 3000);
  }
};
initDb();

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const existing = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) return res.status(400).json({ error: "Profile exists" });
    
    const assignedRole = username === 'admin' ? 'admin' : 'user';
    const result = await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, password, assignedRole] // In a real app, hash this password using bcrypt!
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Identity not located" });
    
    const user = result.rows[0];
    // Simple direct matching for training validation purposes
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid password credentials" });
    }

    res.json({ id: user.id, username: user.username, role: user.role });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/auth/users', async (req, res) => {
  const result = await pool.query("SELECT id, username, role FROM users WHERE role = 'user'");
  res.json(result.rows);
});

app.delete('/api/auth/users/:id', async (req, res) => {
  await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
  res.json({ message: "Purged profile" });
});

app.listen(PORT, () => console.log(`Auth PostgreSQL Node live on port ${PORT}`));
module.exports = app;