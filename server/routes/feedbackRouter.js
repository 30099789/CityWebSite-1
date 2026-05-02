// routes/feedbackRouter.js — Sprint 3 Week 11
const express  = require("express");
const router   = express.Router();
const Feedback = require("../models/Feedback");

// GET all feedback (admin)
router.get("/", async (req, res) => {
  try {
    const items = await Feedback.find().sort({ createdAt: -1 });
    res.json(items);
  } catch {
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
});

// POST submit feedback
router.post("/", async (req, res) => {
  try {
    const { userName, userEmail, category, rating, message } = req.body;
    if (!category || !rating || !message?.trim()) {
      return res.status(400).json({ message: "Category, rating and message are required" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    const item = new Feedback({ userName, userEmail, category, rating, message });
    const saved = await item.save();
    res.status(201).json(saved);
  } catch {
    res.status(500).json({ message: "Failed to submit feedback" });
  }
});

// PUT update feedback (admin — change status or add response)
router.put("/:id", async (req, res) => {
  try {
    const updated = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Feedback not found" });
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Failed to update feedback" });
  }
});

// DELETE feedback (admin)
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Feedback not found" });
    res.json({ message: "Feedback deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete feedback" });
  }
});

module.exports = router;