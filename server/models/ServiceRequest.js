// models/ServiceRequest.js -- Sprint 3
// Stores service requests submitted by residents from the public Services page
// Links to the Service document via serviceId
// message is optional -- residents can submit without adding extra details
// status tracks the request through the admin workflow

const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema(
  {
    // Reference to the service being requested
    serviceId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "Service",
      required: true,
    },
    serviceTitle: {
      type:     String,
      required: true,
    },
    userName: {
      type:     String,
      required: true,
    },
    userEmail: {
      type:     String,
      required: true,
    },
    message: {
      type:    String,
      default: "", // optional -- resident can leave this blank
    },
    // Workflow status: Pending -- In Progress -- Resolved -- Closed
    status: {
      type:    String,
      enum:    ["Pending", "In Progress", "Resolved", "Closed"],
      default: "Pending",
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);