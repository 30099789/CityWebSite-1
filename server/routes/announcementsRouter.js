const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');

// GET all announcements
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch announcements' });
  }
});

// POST create announcement
router.post('/', async (req, res) => {
  try {
    const { title, summary, content, priority, status, date, category, audience, author } = req.body;
    const announcement = new Announcement({
      title,
      summary,
      content,
      priority,
      status,
      date,
      category,
      audience,
      author
    });
    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create announcement' });
  }
});
