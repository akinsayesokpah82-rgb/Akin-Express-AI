import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// Standard setup
const app = express();
app.use(express.json());
app.use(cors());

// ✅ Fix for serving frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// Your routes below
app.get("/api", (req, res) => {
  res.json({ message: "Akin Express AI API running!" });
});

// ✅ Serve frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🧠 Akin Express AI running on port ${PORT}`));
