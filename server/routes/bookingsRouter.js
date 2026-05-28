// routes/bookingsRouter.js
// Bookings — POST is public, /my is public (by email), admin routes are protected

const express  = require("express");
const router   = express.Router();
const mongoose = require("mongoose");
const Booking  = require("../models/Booking");
const { protect, requireAdmin } = require("../middleware/auth");

// POST create booking — public (residents book events)
// Prevents duplicate bookings — one booking per user email per event
router.post("/", async (req, res) => {
  try {
    const { eventId, eventTitle, userName, userEmail, bookingDate, status } = req.body;
    if (!eventId || !userName || !userEmail) {
      return res.status(400).json({ message: "eventId, userName and userEmail are required" });
    }

    // Convert eventId string to ObjectId for reliable duplicate check
    let eventObjectId;
    try {
      eventObjectId = new mongoose.Types.ObjectId(eventId);
    } catch {
      return res.status(400).json({ message: "Invalid eventId format" });
    }

    // Check if this user has already booked this event
    const existing = await Booking.findOne({ eventId: eventObjectId, userEmail }).maxTimeMS(5000);
    if (existing) {
      return res.status(409).json({ message: "You have already booked this event." });
    }

    const booking = new Booking({
      eventId:     eventObjectId,
      eventTitle,
      userName,
      userEmail,
      bookingDate: bookingDate || new Date().toISOString().slice(0, 10),
      status:      status || "Confirmed",
    });
    const saved = await booking.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Booking error:", err.message);
    res.status(500).json({ message: "Failed to create booking", error: err.message });
  }
});

// GET bookings by email — public (residents view their own bookings on profile page)
router.get("/my", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email query parameter is required" });
    const bookings = await Booking.find({ userEmail: email }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error("Fetch bookings error:", err.message);
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