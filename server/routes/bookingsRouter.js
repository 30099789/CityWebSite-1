// routes/bookingsRouter.js
// Bookings — POST is public, /my is public (by email), admin routes are protected

const express = require("express");
const router  = express.Router();
const Booking = require("../models/Booking");
const { protect, requireAdmin } = require("../middleware/auth");

// POST create booking — public (residents book events)
router.post("/", async (req, res) => {
  try {
    const { eventId, eventTitle, userName, userEmail, bookingDate, status } = req.body;
    if (!eventId || !userName || !userEmail) {
      return res.status(400).json({ message: "eventId, userName and userEmail are required" });
    }
    const booking = new Booking({ eventId, eventTitle, userName, userEmail, bookingDate, status: status || "Confirmed" });
    const saved = await booking.save();
    res.status(201).json(saved);
  } catch {
    res.status(500).json({ message: "Failed to create booking" });
  }
});

// GET bookings by email — public (residents view their own bookings on profile page)
router.get("/my", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email query parameter is required" });
    const bookings = await Booking.find({ userEmail: email }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// GET all bookings — admin/staff only
router.get("/", protect, requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// PUT update booking status — admin/staff only
router.put("/:id", protect, requireAdmin, async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Booking not found" });
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Failed to update booking" });
  }
});

// DELETE booking — admin/staff only
router.delete("/:id", protect, requireAdmin, async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking deleted successfully" });
  } catch {
    res.status(500).json({ message: "Failed to delete booking" });
  }
});

module.exports = router;