// routes/announcementsRouter.js
// CRUD for announcements — write routes protected by JWT auth

const express      = require("express");
const router       = express.Router();
const Announcement = require("../models/Announcement");
const { protect, requireAdmin } = require("../middleware/auth");

// GET all announcements — public
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
});

// POST create announcement — admin/staff only
router.post("/", protect, requireAdmin, async (req, res) => {
  try {
    const { title, summary, content, priority, status, date, category, audience, author } = req.body;

    if (!title || !summary || !content || !date || !category || !audience || !author) {
      return res.status(400).json({ message: "All required announcement fields must be completed" });
    }

    const announcement = new Announcement({ title, summary, content, priority, status, date, category, audience, author });
    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    res.status(400).json({ message: "Failed to create announcement", error: error.message });
  }
});

// PUT update announcement — admin/staff only
router.put("/:id", protect, requireAdmin, async (req, res) => {
  try {
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedAnnouncement) return res.status(404).json({ message: "Announcement not found" });
    res.json(updatedAnnouncement);
  } catch (error) {
    console.error("Update announcement error:", error.message);
    res.status(500).json({ message: "Failed to update announcement", error: error.message });
  }
});

// DELETE announcement — admin/staff only
router.delete("/:id", protect, requireAdmin, async (req, res) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete announcement" });
  }
});

module.exports = router;