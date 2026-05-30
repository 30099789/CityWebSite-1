// routes/bookingsRouter.js — Sprint 3
// API routes for event bookings
// Creating and viewing your own bookings is public (no login needed)
// Viewing all bookings, updating status and deleting requires admin/staff login

const express  = require("express");
const router   = express.Router();
const mongoose = require("mongoose");
const Booking  = require("../models/Booking");
const { protect, requireAdmin } = require("../middleware/auth");

// Create a new booking — public (residents book events from EventDetail page)
// Checks for a duplicate first — one booking per user email per event
// Returns 409 if the user has already booked this event
router.post("/", async (req, res) => {
  try {
    const { eventId, eventTitle, userName, userEmail, bookingDate, status } = req.body;
    if (!eventId || !userName || !userEmail) {
      return res.status(400).json({ message: "eventId, userName and userEmail are required" });
    }

    // Convert the eventId string to a MongoDB ObjectId so the duplicate check works correctly
    let eventObjectId;
    try {
      eventObjectId = new mongoose.Types.ObjectId(eventId);
    } catch {
      return res.status(400).json({ message: "Invalid eventId format" });
    }

    // Check if this user already has a booking for this event
    // maxTimeMS(5000) prevents the query hanging if MongoDB is slow
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

// Get bookings for a specific email address — public
// Used by the Profile page to show a resident their own bookings
// ?email=user@email.com
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

// Get all bookings — admin/staff only
// Used by the ManageBookings admin page
router.get("/", protect, requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch {
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// Update a booking status (Confirmed / Pending / Cancelled) — admin/staff only
// Used by the inline status dropdown in ManageBookings
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

// Delete a booking permanently — admin/staff only
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