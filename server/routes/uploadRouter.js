// uploadRouter.js
// Stores uploaded images as Base64 strings in memory
// No disk storage — avoids Render ephemeral filesystem wipe on redeploy
// Images stored directly in MongoDB via the event/service imageUrl field

const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const { protect, requireAdmin } = require("../middleware/auth");

// Use memory storage — file never touches disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ok = allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error("Images only"));
  },
});

// POST /api/upload — converts image to Base64 data URL and returns it
// Client stores this directly in MongoDB as imageUrl
router.post("/", protect, requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image provided." });

  // Convert buffer to Base64 data URL — can be used directly in <img src>
  const base64 = req.file.buffer.toString("base64");
  const dataUrl = `data:${req.file.mimetype};base64,${base64}`;

  res.json({ imageUrl: dataUrl });
});

module.exports = router;