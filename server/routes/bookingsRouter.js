// routes/bookingsRouter.js — Sprint 3 Week 8
const express = require("express");
const router  = express.Router();
const Booking = require("../models/Booking");

// POST create booking
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

// GET all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// PUT update booking status
router.put("/:id", async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Booking not found" });
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Failed to update booking" });
  }
});

// DELETE booking
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking deleted successfully" });
  } catch {
    res.status(500).json({ message: "Failed to delete booking" });
  }
});

module.exports = router;