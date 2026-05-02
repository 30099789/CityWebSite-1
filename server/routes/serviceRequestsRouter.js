const express        = require("express");
const router         = express.Router();
const ServiceRequest = require("../models/ServiceRequest");

// GET all service requests (admin)
router.get("/", async (req, res) => {
  try {
    const requests = await ServiceRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch {
    res.status(500).json({ message: "Failed to fetch service requests" });
  }
});

// POST create service request
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

// PUT update status (admin)
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