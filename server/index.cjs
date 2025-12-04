const express = require("express");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const { DB_HOST, DB_USER, DB_PASS, DB_NAME, APP_PORT, API_KEY } = process.env;

if (!DB_HOST || !DB_USER) {
  console.error("Missing DB configuration in environment (.env)");
  process.exit(1);
}

const database = DB_NAME || "quality";

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Serve uploaded files statically at /uploads
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9_-]/gi, "_");
    const filename = `${Date.now()}_${base}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

function requireApiKey(req, res, next) {
  if (!API_KEY) return next(); // not configured, skip
  const key = req.headers["x-api-key"] || req.query.api_key;
  if (key === API_KEY) return next();
  return res.status(401).json({ error: "Unauthorized" });
}

// Helper to check whether IMAGE_PATH column exists
async function hasImageColumn() {
  try {
    const [rows] = await pool.query(
      "SELECT COUNT(*) as cnt FROM information_schema.columns WHERE table_schema = ? AND table_name = ? AND column_name = ?",
      [database, "PRODUCT", "IMAGE_PATH"]
    );
    return rows[0].cnt > 0;
  } catch (err) {
    console.error("Error checking columns", err);
    return false;
  }
}

// Ensure PRODUCT_IMAGES table exists (create if missing)
async function ensureProductImagesTable() {
  const createSQL = `
    CREATE TABLE IF NOT EXISTS PRODUCT_IMAGES (
      IMAGE_ID INT AUTO_INCREMENT PRIMARY KEY,
      PRODUCT_ID INT NOT NULL,
      IMAGE_PATH VARCHAR(1024) NOT NULL,
      UPLOAD_DATE DATETIME DEFAULT NOW(),
      INDEX (PRODUCT_ID)
    ) ENGINE=InnoDB;
  `;
  try {
    await pool.query(createSQL);
  } catch (err) {
    console.error("Error creating PRODUCT_IMAGES table", err);
  }
}

app.post(
  "/api/products",
  requireApiKey,
  upload.array("images", 20),
  async (req, res) => {
    try {
      const name = req.body.name;
      const prog = req.body.prog;
      if (!name || !prog)
        return res.status(400).json({ error: "name and prog are required" });

      const files = req.files || [];

      // Insert product first
      const [productResult] = await pool.query(
        "INSERT INTO PRODUCT (NAME, DRAWING_NUMBER, CREATE_DATE) VALUES (?, ?, NOW())",
        [name, prog]
      );
      const productId = productResult.insertId || null;

      // If there are files, ensure images table and insert image rows
      let imagesInserted = [];
      if (files.length > 0) {
        await ensureProductImagesTable();

        const insertPromises = files.map((f) => {
          const imgPath = path.relative(__dirname, f.path);
          return pool
            .query(
              "INSERT INTO PRODUCT_IMAGES (PRODUCT_ID, IMAGE_PATH, UPLOAD_DATE) VALUES (?, ?, NOW())",
              [productId, imgPath]
            )
            .then(([r]) => ({ insertedId: r.insertId, imagePath: imgPath }));
        });

        imagesInserted = await Promise.all(insertPromises);
      }

      res.json({ productId, images: imagesInserted });
    } catch (err) {
      console.error("DB error", err);
      res.status(500).json({ error: "Database error", details: err.message });
    }
  }
);

    // GET /api/products - return products with their images
    app.get('/api/products', requireApiKey, async (req, res) => {
      try {
        await ensureProductImagesTable();

        const [rows] = await pool.query(
          `SELECT p.PRODUCT_ID as productId, p.NAME as name, p.DRAWING_NUMBER as drawingNumber,
                  pi.IMAGE_ID as imageId, pi.IMAGE_PATH as imagePath
           FROM PRODUCT p
           LEFT JOIN PRODUCT_IMAGES pi ON p.PRODUCT_ID = pi.PRODUCT_ID
           ORDER BY p.PRODUCT_ID, pi.IMAGE_ID`
        );

        const productsMap = new Map();
        for (const r of rows) {
          const pid = r.productId;
          if (!productsMap.has(pid)) {
            productsMap.set(pid, { productId: pid, name: r.name, drawingNumber: r.drawingNumber, images: [] });
          }
          if (r.imageId && r.imagePath) {
            let url = r.imagePath.replace(/\\\\/g, '/');
            if (!url.startsWith('/')) url = '/' + url;
            productsMap.get(pid).images.push({ imageId: r.imageId, url });
          }
        }

        const products = Array.from(productsMap.values());
        res.json({ products });
      } catch (err) {
        console.error('DB error', err);
        res.status(500).json({ error: 'Database error', details: err.message });
      }
    });

const port = APP_PORT || 3003;
app.listen(port, () => console.log(`Server listening on port ${port}`));
