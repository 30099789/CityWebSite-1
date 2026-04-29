const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
// GET all services
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch services' });
  }
});

// POST create service
router.post('/', async (req, res) => {
  try {
    const { title, description, category, contact } = req.body;
    if (!title || !description || !category || !contact) {
        return res.status(400).json({ message: 'Title, description, category and contact are required' });
    }
    else if (!/^[0-9]{10}$/.test(contact.phone) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
        return res.status(400).json({ message: 'Invalid phone number or email format' });
    }
    const service = new Service({
      title,
      description,
      category,
      contact
    });
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create service' });
  }
});

// PUT update service
router.put('/:id', async (req, res) => {
  try {
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
        { new: true }
    );
    if (!updatedService) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(updatedService);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update service' });
  }
});

// DELETE service
router.delete('/:id', async (req, res) => {
  try {
    const deletedService = await Service.findByIdAndDelete(req.params.id);
    if (!deletedService) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
    } catch (error) {
    res.status(500).json({ message: 'Failed to delete service' });
    }
});

module.exports = router;