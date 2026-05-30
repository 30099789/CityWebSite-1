// models/Service.js -- Sprint 3
// Stores council services shown on the public Services page
// contact is a nested object with phone and email
// Phone must be exactly 10 digits (e.g. 0890000001)
// imageUrl stores a Base64 image string -- empty string if no image uploaded

const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type:     String,
      required: true,
      trim:     true,
    },
    description: {
      type:     String,
      required: true,
      trim:     true,
    },
    category: {
      type:     String,
      required: true,
      trim:     true,
    },
    // Nested contact details -- both phone and email are required
    contact: {
      phone: {
        type:     String,
        required: true,
        match:    [/^[0-9]{10}$/, "Invalid phone number"], // must be exactly 10 digits
      },
      email: {
        type:     String,
        required: true,
        match:    [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"],
      },
    },
    imageUrl: {
      type:    String,
      default: "", // empty string means no image has been uploaded
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("Service", serviceSchema);