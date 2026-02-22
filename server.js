import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Your PocketBase URL (Railway or Fly.io)
const PB_URL = process.env.PB_URL;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Proxy all API requests to PocketBase
app.use("/api", async (req, res) => {
  try {
    const url = PB_URL + req.url;
    const options = {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: ["GET", "HEAD"].includes(req.method) ? undefined : JSON.stringify(req.body)
    };

    const pbRes = await fetch(url, options);
    const data = await pbRes.text();

    res.status(pbRes.status).send(data);
  } catch (err) {
    res.status(500).json({ error: "PocketBase proxy failed", details: err.message });
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
