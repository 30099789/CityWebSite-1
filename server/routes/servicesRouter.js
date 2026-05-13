// routes/servicesRouter.js — Sprint 3 (with image upload)
const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const Service = require("../models/Service");

// ── Image upload setup ────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, "../uploads/services");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ok = allowed.test(path.extname(file.originalname).toLowerCase()) &&
             allowed.test(file.mimetype);
  ok ? cb(null, true) : cb(new Error("Images only"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });

// POST /api/services/upload-image
router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image provided." });
  res.json({ imageUrl: `/uploads/services/${req.file.filename}` });
});

// GET all services
router.get("/", async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch {
    res.status(500).json({ message: "Failed to fetch services" });
  }
});
// GET service by ID
router.get("/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });
    res.json(service);
  } catch {
    res.status(500).json({ message: "Failed to fetch service" });
  }
});
// POST create service
router.post("/", async (req, res) => {
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

// PUT update service
router.put("/:id", async (req, res) => {
  try {
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: "Service not found" });
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Failed to update service" });
  }
});

// DELETE service
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Service.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Service not found" });
    res.json({ message: "Service deleted successfully" });
  } catch {
    res.status(500).json({ message: "Failed to delete service" });
  }
});

module.exports = router;