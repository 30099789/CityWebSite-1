const express = require("express");
const router  = require("express").Router();
const Event   = require("../models/Event");

// GET all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// GET single event by id
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch {
    res.status(500).json({ message: "Failed to fetch event" });
  }
});

// POST create event
router.post("/", async (req, res) => {
  try {
    const { title, date, location, description, category, time, capacity, status, imageUrl } = req.body;
    if (!title || !date || !location) {
      return res.status(400).json({ message: "Title, date and location are required" });
    }
    const newEvent = new Event({ title, date, location, description, category, time, capacity, status, imageUrl: imageUrl || "" });
    const saved = await newEvent.save();
    res.status(201).json(saved);
  } catch {
    res.status(500).json({ message: "Failed to create event" });
  }
});

// PUT update event
router.put("/:id", async (req, res) => {
  try {
    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Event not found" });
    res.json(updated);
  } catch {
    res.status(500).json({ message: "Failed to update event" });
  }
});

// DELETE event
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted successfully" });
  } catch {
    res.status(500).json({ message: "Failed to delete event" });
  }
});

module.exports = router;