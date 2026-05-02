// routes/contactRouter.js — Sprint 3 Week 11
const express  = require("express");
const router   = express.Router();
const mongoose = require("mongoose");

// Inline Contact schema — simple enquiry store
const contactSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, trim: true },
    subject: { type: String, default: "", trim: true },
    message: { type: String, required: true, trim: true },
    status:  { type: String, enum: ["New", "Read", "Replied"], default: "New" },
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);

// POST submit contact enquiry
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ message: "Name, email and message are required" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }
    const enquiry = new Contact({ name, email, subject, message });
    const saved   = await enquiry.save();
    res.status(201).json({ message: "Enquiry received", id: saved._id });
  } catch {
    res.status(500).json({ message: "Failed to submit enquiry" });
  }
});

// GET all enquiries (admin)
router.get("/", async (req, res) => {
  try {
    const items = await Contact.find().sort({ createdAt: -1 });
    res.json(items);
  } catch {
    res.status(500).json({ message: "Failed to fetch enquiries" });
  }
});

module.exports = router;