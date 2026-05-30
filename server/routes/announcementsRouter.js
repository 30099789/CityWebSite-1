// routes/announcementsRouter.js — Sprint 3
// API routes for announcements
// Reading announcements is public — anyone can view them
// Creating, editing and deleting requires a JWT token (admin or staff only)

const express      = require("express");
const router       = express.Router();
const Announcement = require("../models/Announcement");
const { protect, requireAdmin } = require("../middleware/auth");

// Get all announcements — sorted newest first
// Public route — no login needed
// Used by the public Announcements page and the admin table
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch announcements" });
  }
});

// Create a new announcement — admin/staff only
// Validates that all required fields are present before saving
// Returns 400 if any required field is missing
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

// Update an existing announcement — admin/staff only
// Used for editing content and toggling publish/unpublish status
// $set only updates the fields that are sent — leaves others unchanged
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

// Delete an announcement permanently — admin/staff only
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