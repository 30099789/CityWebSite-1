// routes/announcementsRouter.js — JWT protected write routes
const express  = require("express");
const router   = express.Router();
const Announcement = require("../models/Announcement");
const { protect, requireAdmin } = require("../middleware/auth");

// GET all — public
router.get("/", async (req, res) => {
  try {
    const items = await Announcement.find().sort({ createdAt: -1 });
    res.json(items);
  } catch {
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
});

// POST — admin/staff only
router.post("/", protect, requireAdmin, async (req, res) => {
  try {
    const item = new Announcement(req.body);
    const saved = await item.save();
    res.status(201).json(saved);
  } catch {
    res.status(500).json({ message: "Failed to create announcement" });
  }
});

// PUT — admin/staff only
router.put("/:id", protect, requireAdmin, async (req, res) => {
  try {
    const updated = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Announcement not found" });
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Failed to update announcement" });
  }
});

// DELETE — admin/staff only
router.delete("/:id", protect, requireAdmin, async (req, res) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Deleted successfully" });
  } catch {
    res.status(500).json({ message: "Failed to delete announcement" });
  }
});

module.exports = router;