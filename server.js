import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount backend API
app.use("/api", router);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Fallback for SPA/PWA routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Real Tree Guy running on port ${PORT}`);
});
