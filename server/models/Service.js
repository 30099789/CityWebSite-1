const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      phone: {
        type: String,
        required: true,
        match: [/^[0-9]{10}$/, "Invalid phone number"],
      },
      email: {
        type: String,
        required: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"],
      },
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

module.exports = mongoose.model("Service", serviceSchema);