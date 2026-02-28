import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Your PocketBase URL (Railway)
const PB_URL = process.env.PB_URL;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Proxy all API requests to PocketBase
app.use("/api", async (req, res) => {
  try {
    const url = PB_URL + req.url;

    const headers = {
      "Content-Type": req.headers["content-type"] || "application/json",
      "Authorization": req.headers["authorization"] || ""
    };

    const options = {
      method: req.method,
      headers,
      body: ["GET", "HEAD"].includes(req.method)
        ? undefined
        : req.body instanceof Buffer
        ? req.body
        : JSON.stringify(req.body)
    };

    const pbRes = await fetch(url, options);
    const data = await pbRes.text();

    res.status(pbRes.status).send(data);
  } catch (err) {
    res.status(500).json({
      error: "PocketBase proxy failed",
      details: err.message
    });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Fallback for PWA routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Real Tree Guy running on port ${PORT}`);
});
import express from "express";
import pg from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";

const router = express.Router();
const db = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const upload = multer({ storage: multer.memoryStorage() });
const JWT_SECRET = process.env.JWT_SECRET;

// =========================
// AUTH MIDDLEWARE
// =========================
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// =========================
// /api/me
// =========================
router.get("/me", auth, async (req, res) => {
  const result = await db.query("SELECT id, email, role, hasPaidAccess FROM users WHERE id = $1", [req.user.id]);
  res.json(result.rows[0]);
});

// =========================
// /api/register/treeguy
// =========================
router.post("/register/treeguy", async (req, res) => {
  const { email, password, businessName, phone, city, state, treeRole } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const result = await db.query(
    `INSERT INTO users (email, password, role, hasPaidAccess, businessName, phone, city, state, treeRole)
     VALUES ($1,$2,'treeguy',true,$3,$4,$5,$6,$7)
     RETURNING id, email, role, hasPaidAccess`,
    [email, hashed, businessName, phone, city, state, treeRole]
  );

  const user = result.rows[0];
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

  res.json({ token, user });
});

// =========================
// /api/payments/unlock-treeguy
// =========================
router.post("/payments/unlock-treeguy", auth, async (req, res) => {
  const { amount, type, status } = req.body;

  await db.query(
    `INSERT INTO payments (user_id, amount, type, status)
     VALUES ($1,$2,$3,$4)`,
    [req.user.id, amount, type, status]
  );

  await db.query(`UPDATE users SET hasPaidAccess = true WHERE id = $1`, [req.user.id]);

  res.json({ success: true });
});

// =========================
// /api/profile/business (GET)
// =========================
router.get("/profile/business", auth, async (req, res) => {
  const result = await db.query(
    `SELECT * FROM business_profile WHERE user_id = $1 LIMIT 1`,
    [req.user.id]
  );

  if (result.rows.length === 0) return res.status(404).json({ error: "No profile" });

  res.json(result.rows[0]);
});

// =========================
// /api/profile/business/create
// =========================
router.post("/profile/business/create", auth, upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "insurancePhoto", maxCount: 1 }
]), async (req, res) => {

  const { name, owner, phone, email, address, license, insurance } = req.body;

  const logo = req.files.logo?.[0] || null;
  const insurancePhoto = req.files.insurancePhoto?.[0] || null;

  const result = await db.query(
    `INSERT INTO business_profile
     (user_id, name, owner, phone, email, address, license, insurance, logo, insurancePhoto)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      req.user.id,
      name,
      owner,
      phone,
      email,
      address,
      license,
      insurance,
      logo ? logo.buffer : null,
      insurancePhoto ? insurancePhoto.buffer : null
    ]
  );

  res.json(result.rows[0]);
});

// =========================
// /api/profile/business/update
// =========================
router.post("/profile/business/update", auth, upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "insurancePhoto", maxCount: 1 }
]), async (req, res) => {

  const { name, owner, phone, email, address, license, insurance } = req.body;

  const logo = req.files.logo?.[0] || null;
  const insurancePhoto = req.files.insurancePhoto?.[0] || null;

  const result = await db.query(
    `UPDATE business_profile
     SET name=$1, owner=$2, phone=$3, email=$4, address=$5, license=$6, insurance=$7,
         logo = COALESCE($8, logo),
         insurancePhoto = COALESCE($9, insurancePhoto)
     WHERE user_id=$10
     RETURNING *`,
    [
      name,
      owner,
      phone,
      email,
      address,
      license,
      insurance,
      logo ? logo.buffer : null,
      insurancePhoto ? insurancePhoto.buffer : null,
      req.user.id
    ]
  );

  res.json(result.rows[0]);
});

export default router;
