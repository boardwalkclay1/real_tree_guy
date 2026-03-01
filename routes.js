import express from "express";
import pg from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";

const router = express.Router();

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

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
  const result = await db.query(
    "SELECT id, email, role FROM users WHERE id = $1",
    [req.user.id]
  );
  res.json(result.rows[0]);
});

// =========================
// /api/register/treeguy
// =========================
router.post("/register/treeguy", async (req, res) => {
  const { email, password, name, phone } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const result = await db.query(
    `INSERT INTO users (email, password_hash, role, name, phone)
     VALUES ($1,$2,'tree_guy',$3,$4)
     RETURNING id, email, role`,
    [email, hashed, name, phone]
  );

  const user = result.rows[0];
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

  res.json({ token, user });
});

// =========================
// /api/payments/unlock-treeguy
// =========================
router.post("/payments/unlock-treeguy", auth, async (req, res) => {
  const { amount, status } = req.body;

  await db.query(
    `INSERT INTO payments (job_id, client_id, tree_guy_id, amount, status)
     VALUES (NULL, $1, $1, $2, $3)`,
    [req.user.id, amount, status]
  );

  res.json({ success: true });
});

// =========================
// /api/profile/business (GET)
// =========================
router.get("/profile/business", auth, async (req, res) => {
  const result = await db.query(
    `SELECT * FROM tree_guy_profiles WHERE user_id = $1 LIMIT 1`,
    [req.user.id]
  );

  if (result.rows.length === 0)
    return res.status(404).json({ error: "No profile" });

  res.json(result.rows[0]);
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

    const result = await db.query(
      `INSERT INTO tree_guy_profiles
       (user_id, company_name, bio, service_area)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [req.user.id, company_name, bio, service_area]
    );

    res.json(result.rows[0]);
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

    const result = await db.query(
      `UPDATE tree_guy_profiles
       SET company_name=$1, bio=$2, service_area=$3
       WHERE user_id=$4
       RETURNING *`,
      [company_name, bio, service_area, req.user.id]
    );

    res.json(result.rows[0]);
  }
);

export default router;
