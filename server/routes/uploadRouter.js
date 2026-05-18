const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create uploads folder if it doesn’t exist
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
destination: (req, file, cb) => {
cb(null, uploadDir);
},
filename: (req, file, cb) => {
const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
cb(null, uniqueName);
},
});

// File filter — images only
const fileFilter = (req, file, cb) => {
const allowed = /jpeg|jpg|png|gif|webp/;
const extname = allowed.test(path.extname(file.originalname).toLowerCase());
const mimetype = allowed.test(file.mimetype);
if (extname && mimetype) {
cb(null, true);
} else {
cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
}
};

const upload = multer({
storage,
fileFilter,
limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// POST /api/upload
router.post("/", upload.single("image"), (req, res) => {
if (!req.file) {
return res.status(400).json({ message: "No file uploaded" });
}
// Return the URL path to the uploaded file
const imageUrl = `/uploads/${req.file.filename}`;
res.json({ imageUrl });
});

module.exports = router;