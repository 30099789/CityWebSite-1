const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "General",
    },
    capacity: {
      type: Number,
      default: 0,
    },
    booked: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Upcoming", "Full", "Completed", "Cancelled"],
      default: "Upcoming",
    },
    imageUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema);