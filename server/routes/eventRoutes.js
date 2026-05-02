// routes/eventRoutes.js — JWT protected write routes
const express = require("express");
const router  = express.Router();
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const Event   = require("../models/Event");
const { protect, requireAdmin } = require("../middleware/auth");

// Image upload setup
const uploadDir = path.join(__dirname, "../uploads/events");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

// POST upload image — admin/staff only
router.post("/upload-image", protect, requireAdmin, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No image provided." });
  res.json({ imageUrl: `/uploads/events/${req.file.filename}` });
});

// GET all — public
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// GET single — public
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch {
    res.status(500).json({ message: "Failed to fetch event" });
  }
});

// POST create — admin/staff only
router.post("/", protect, requireAdmin, async (req, res) => {
  try {
    const { title, date, location } = req.body;
    if (!title || !date || !location) {
      return res.status(400).json({ message: "Title, date and location are required" });
    }
    const event = new Event(req.body);
    const saved = await event.save();
    res.status(201).json(saved);
  } catch {
    res.status(500).json({ message: "Failed to create event" });
  }
});

// PUT update — admin/staff only
router.put("/:id", protect, requireAdmin, async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Event not found" });
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Failed to update event" });
  }
});

// DELETE — admin/staff only
router.delete("/:id", protect, requireAdmin, async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted successfully" });
  } catch {
    res.status(500).json({ message: "Failed to delete event" });
  }
});

module.exports = router;