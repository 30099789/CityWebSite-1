// uploadRouter.js
// Receives compressed Base64 image from client and returns it as imageUrl
// Stored directly in MongoDB — no disk storage needed
// Avoids Render ephemeral filesystem wipe on redeploy

const express = require("express");
const router  = express.Router();
const { protect, requireAdmin } = require("../middleware/auth");

// POST /api/upload — accepts { base64 } JSON body, returns { imageUrl }
// Client compresses image first, sends as Base64 data URL
router.post("/", protect, requireAdmin, (req, res) => {
  const { base64 } = req.body;

  if (!base64 || !base64.startsWith("data:image/")) {
    return res.status(400).json({ message: "Valid Base64 image required." });
  }

  // Return the Base64 string as imageUrl — stored directly in MongoDB
  res.json({ imageUrl: base64 });
});

module.exports = router;