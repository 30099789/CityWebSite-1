// routes/serviceRequestsRouter.js -- Sprint 3
// API routes for service requests submitted by residents
// Residents submit requests from the public Services page
// Admin views and updates request status from ManageServiceRequests page

const express        = require("express");
const router         = express.Router();
const ServiceRequest = require("../models/ServiceRequest");

// Get all service requests -- used by the admin ManageServiceRequests page
// Sorted newest first
router.get("/", async (req, res) => {
  try {
    const requests = await ServiceRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch {
    res.status(500).json({ message: "Failed to fetch service requests" });
  }
});

// Submit a new service request from the public Services page
// Requires serviceId, userName and userEmail -- message is optional
router.post("/", async (req, res) => {
  try {
    const { serviceId, serviceTitle, userName, userEmail, message } = req.body;
    if (!serviceId || !userName || !userEmail) {
      return res.status(400).json({ message: "serviceId, userName and userEmail are required" });
    }
    const request = new ServiceRequest({ serviceId, serviceTitle, userName, userEmail, message });
    const saved = await request.save();
    res.status(201).json(saved);
  } catch {
    res.status(500).json({ message: "Failed to submit service request" });
  }
});

// Update a service request -- used by admin to change status
// Status moves from Pending to In Progress to Resolved to Closed
router.put("/:id", async (req, res) => {
  try {
    const updated = await ServiceRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Request not found" });
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Failed to update request" });
  }
});

module.exports = router;