const express = require("express");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const { DB_HOST, DB_USER, DB_PASS, APP_PORT } = process.env;

if (!DB_HOST || !DB_USER) {
  console.error("Missing DB configuration in environment (.env)");
  process.exit(1);
}

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: "quality",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.post("/api/products", async (req, res) => {
  try {
    const { name, prog } = req.body;
    if (!name || !prog)
      return res.status(400).json({ error: "name and prog are required" });

    const [result] = await pool.query(
      "INSERT INTO PRODUCT (NAME, DRAWING_NUMBER, CREATE_DATE) VALUES (?, ?, NOW())",
      [name, prog]
    );

    const insertedId = result.insertId || null;
    res.json({ productId: insertedId });
  } catch (err) {
    console.error("DB error", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

const port = APP_PORT || 3003;
app.listen(port, () => console.log(`Server listening on port ${port}`));
