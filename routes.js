import express from "express";
import pg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import rateLimit from "express-rate-limit";

const router = express.Router();

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const upload = multer({ storage: multer.memoryStorage() });
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not set. Using insecure default. Set JWT_SECRET in production.");
}
const SECRET = JWT_SECRET || "rtg-dev-secret-change-in-production";

// =========================
// RATE LIMITERS
// =========================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});

router.use(apiLimiter);

// =========================
// AUTH MIDDLEWARE
// =========================
function auth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// =========================
// /api/health
// =========================
router.get("/health", (req, res) => {
  res.json({ status: "ok", app: "Real Tree Guy OS" });
});

// =========================
// /api/me
// =========================
router.get("/me", auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.email, u.role,
              EXISTS(
                SELECT 1 FROM payments
                WHERE tree_guy_id = u.id AND status IS NOT NULL
              ) AS "hasPaidAccess"
       FROM users u WHERE u.id = $1`,
      [req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// =========================
// /api/login
// =========================
router.post("/login", authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    const result = await db.query(
      "SELECT id, email, role, password_hash FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const payResult = await db.query(
      "SELECT 1 FROM payments WHERE tree_guy_id = $1 LIMIT 1",
      [user.id]
    );

    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "7d" });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        hasPaidAccess: payResult.rows.length > 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// =========================
// /api/register/treeguy
// =========================
router.post("/register/treeguy", authLimiter, async (req, res) => {
  const { email, password, name, businessName, phone, city, state, treeRole } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    const hashed = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (email, password_hash, role, name, phone)
       VALUES ($1,$2,'treeguy',$3,$4)
       RETURNING id, email, role`,
      [email, hashed, businessName || name, phone]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "7d" });

    res.json({ token, user: { ...user, hasPaidAccess: false } });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: "Database error" });
  }
});

// =========================
// /api/register/client
// =========================
router.post("/register/client", authLimiter, async (req, res) => {
  const { email, password, name, phone, city, state } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password required" });

  try {
    const hashed = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (email, password_hash, role, name, phone)
       VALUES ($1,$2,'client',$3,$4)
       RETURNING id, email, role`,
      [email, hashed, name, phone]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: "7d" });

    res.json({ token, user });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: "Database error" });
  }
});

// =========================
// /api/payments/unlock-treeguy
// =========================
router.post("/payments/unlock-treeguy", auth, async (req, res) => {
  const { amount, status } = req.body;

  try {
    await db.query(
      `INSERT INTO payments (job_id, client_id, tree_guy_id, amount, status)
       VALUES (NULL, $1, $1, $2, $3)`,
      [req.user.id, amount || 30, status || "paid"]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// =========================
// /api/payments/treeguy (PayPal SDK flow)
// =========================
router.post("/payments/treeguy", auth, async (req, res) => {
  const { paypalOrderId } = req.body;

  try {
    await db.query(
      `INSERT INTO payments (job_id, client_id, tree_guy_id, amount, status)
       VALUES (NULL, $1, $1, 30, $2)`,
      [req.user.id, paypalOrderId || "paypal_approved"]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// =========================
// /api/profile/business (GET)
// =========================
router.get("/profile/business", auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM tree_guy_profiles WHERE user_id = $1 LIMIT 1`,
      [req.user.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "No profile" });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// =========================
// /api/profile/business/create
// =========================
router.post(
  "/profile/business/create",
  auth,
  upload.none(),
  async (req, res) => {
    const { company_name, bio, service_area } = req.body;

    try {
      const result = await db.query(
        `INSERT INTO tree_guy_profiles
         (user_id, company_name, bio, service_area)
         VALUES ($1,$2,$3,$4)
         RETURNING *`,
        [req.user.id, company_name, bio, service_area]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  }
);

// =========================
// /api/profile/business/update
// =========================
router.post(
  "/profile/business/update",
  auth,
  upload.none(),
  async (req, res) => {
    const { company_name, bio, service_area } = req.body;

    try {
      const result = await db.query(
        `UPDATE tree_guy_profiles
         SET company_name=$1, bio=$2, service_area=$3
         WHERE user_id=$4
         RETURNING *`,
        [company_name, bio, service_area, req.user.id]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  }
);

export default router;
