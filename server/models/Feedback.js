// models/Feedback.js -- Sprint 3
// Stores community feedback submissions from the public /feedback page
// userName and userEmail are optional -- residents can submit without logging in
// status tracks where the feedback is in the review workflow
// response stores the admin reply once one has been written

const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    userName:  { type: String, default: "Guest" },
    userEmail: { type: String, default: "" },
    category:  { type: String, required: true },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    message:   { type: String, required: true, trim: true },
    // Status workflow: New -- In Progress -- Resolved -- Closed
    status: {
      type:    String,
      enum:    ["New", "In Progress", "Resolved", "Closed"],
      default: "New",
    },
    response: { type: String, default: "" }, // admin response saved here
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("Feedback", feedbackSchema);