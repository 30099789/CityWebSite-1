// models/Faq.js -- Sprint 3
// Stores FAQ questions so admin can manage them through the portal
// Admin uploads faq.xml via XML Manager -- questions are saved here
// The public FAQ page reads from this collection instead of the XML file

const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    category:  { type: String, required: true, trim: true },
    question:  { type: String, required: true, trim: true },
    answer:    { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Faq", faqSchema);