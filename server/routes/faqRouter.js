// routes/faqRouter.js -- Sprint 3
// API routes for FAQ questions
// Reading is public -- the public FAQ page fetches from here
// Creating, updating and deleting requires admin or staff login

const express = require("express");
const router  = express.Router();
const Faq     = require("../models/Faq");
const { protect, requireAdmin } = require("../middleware/auth");

// Get all FAQ items -- public, sorted by category then sort order
router.get("/", async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ category: 1, sortOrder: 1, createdAt: 1 });
    res.json(faqs);
  } catch {
    res.status(500).json({ message: "Failed to fetch FAQs" });
  }
});

// Create a new FAQ item -- used by XmlManager import
router.post("/", protect, requireAdmin, async (req, res) => {
  try {
    const { category, question, answer, sortOrder } = req.body;
    if (!category || !question || !answer) {
      return res.status(400).json({ message: "Category, question and answer are required" });
    }
    const faq = new Faq({ category, question, answer, sortOrder: sortOrder || 0 });
    await faq.save();
    res.status(201).json(faq);
  } catch {
    res.status(500).json({ message: "Failed to create FAQ" });
  }
});

// Update a FAQ item -- admin/staff only
router.put("/:id", protect, requireAdmin, async (req, res) => {
  try {
    const updated = await Faq.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "FAQ not found" });
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Failed to update FAQ" });
  }
});

// Delete a FAQ item -- admin/staff only
router.delete("/:id", protect, requireAdmin, async (req, res) => {
  try {
    const deleted = await Faq.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "FAQ not found" });
    res.json({ message: "FAQ deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete FAQ" });
  }
});

module.exports = router;