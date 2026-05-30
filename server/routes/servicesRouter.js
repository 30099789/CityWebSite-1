// routes/servicesRouter.js -- Sprint 3
// API routes for council services
// Reading services is public -- anyone can view them
// Creating, editing and deleting requires admin or staff login
// Phone must be exactly 10 digits to pass validation (e.g. 0890000001)

const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const Service = require("../models/Service");
const { protect, requireAdmin } = require("../middleware/auth");

// Legacy disk-based image upload setup -- kept for backwards compatibility
// New uploads use Base64 via uploadRouter.js instead
const uploadDir = path.join(__dirname, "../uploads/services");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

// Only allow image file types
const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase()) &&
             allowed.test(file.mimetype);
  ok ? cb(null, true) : cb(new Error("Images only"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });

// Legacy image upload endpoint -- admin/staff only
// New code uses POST /api/upload (Base64) instead
router.post("/upload-image", protect, requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image provided." });
  res.json({ imageUrl: `/uploads/services/${req.file.filename}` });
});

// Get all services -- public route, no login needed
// Used by the public Services page and the admin table
router.get("/", async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch {
    res.status(500).json({ message: "Failed to fetch services" });
  }
});

// Create a new service -- admin/staff only
// Validates all required fields including phone (10 digits) and email format
router.post("/", protect, requireAdmin, async (req, res) => {
  try {
    const { title, description, category, contact, imageUrl } = req.body;
    if (!title || !description || !category || !contact?.phone || !contact?.email) {
      return res.status(400).json({ message: "Title, description, category, phone and email are required" });
    }
    if (!/^[0-9]{10}$/.test(contact.phone) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      return res.status(400).json({ message: "Invalid phone number or email format" });
    }
    const service = new Service({ title, description, category, contact, imageUrl: imageUrl || "" });
    await service.save();
    res.status(201).json(service);
  } catch {
    res.status(400).json({ message: "Failed to create service" });
  }
});

// Update an existing service -- admin/staff only
router.put("/:id", protect, requireAdmin, async (req, res) => {
  try {
    const updated = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Service not found" });
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Failed to update service" });
  }
});

// Delete a service permanently -- admin/staff only
router.delete("/:id", protect, requireAdmin, async (req, res) => {
  try {
    const deleted = await Service.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Service not found" });
    res.json({ message: "Service deleted successfully" });
  } catch {
    res.status(500).json({ message: "Failed to delete service" });
  }
});

module.exports = router;