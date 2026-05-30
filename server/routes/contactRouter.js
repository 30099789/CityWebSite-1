// routes/contactRouter.js — Sprint 3 Week 11
// API routes for the Contact Us form
// Saves enquiries to MongoDB and lets admin read them
// The Contact schema is defined here (inline) rather than in a separate models file

const express  = require("express");
const router   = express.Router();
const mongoose = require("mongoose");

// Contact schema — stores enquiries submitted from the /contact page
// Status tracks whether the enquiry has been read or replied to
const contactSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, trim: true },
    subject: { type: String, default: "", trim: true },   // optional field
    message: { type: String, required: true, trim: true },
    status:  { type: String, enum: ["New", "Read", "Replied"], default: "New" },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

const Contact = mongoose.model("Contact", contactSchema);

// Save a new contact enquiry — public, no login needed
// Validates name, email and message before saving
// Returns 400 if required fields are missing or email format is invalid
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ message: "Name, email and message are required" });
    }

    // Check the email looks like a real address
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

// Get all contact enquiries — used by admin to review submissions
// Sorted newest first
router.get("/", async (req, res) => {
  try {
    const items = await Contact.find().sort({ createdAt: -1 });
    res.json(items);
  } catch {
    res.status(500).json({ message: "Failed to fetch enquiries" });
  }
});

module.exports = router;