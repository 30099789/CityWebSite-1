const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    userName:  { type: String, default: "Guest" },
    userEmail: { type: String, default: "" },
    category:  { type: String, required: true },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    message:   { type: String, required: true, trim: true },
    status:    {
      type: String,
      enum: ["New", "In Progress", "Resolved", "Closed"],
      default: "New",
    },
    response:  { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", feedbackSchema);