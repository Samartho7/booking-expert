const express = require('express');
const Expert = require('../models/Expert');
const Booking = require('../models/Booking');

const router = express.Router();

// GET /api/experts
// Query params: page, limit, search, category
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Search by name
    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: 'i' };
    }

    // Filter by category
    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }

    const experts = await Expert.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ rating: -1 });

    const total = await Expert.countDocuments(query);

    res.json({
      experts,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error fetching experts:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/experts/:id
router.get('/:id', async (req, res) => {
  try {
    const expert = await Expert.findById(req.params.id);
    if (!expert) {
      return res.status(404).json({ message: 'Expert not found' });
    }
    res.json(expert);
  } catch (error) {
    console.error('Error fetching expert details:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/experts/:id/book
router.post('/:id/book', async (req, res) => {
  try {
    const { slotId, userName, userEmail, userPhone, notes } = req.body;
    
    // Validate required fields
    if (!userName || !userName.trim()) {
      return res.status(400).json({ error: 'Validation Error', message: 'Name is required' });
    }
    
    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userEmail || !emailRegex.test(userEmail)) {
      return res.status(400).json({ error: 'Validation Error', message: 'A valid Email is required' });
    }
    
    // Phone length validation (basic check)
    if (!userPhone || userPhone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ error: 'Validation Error', message: 'A valid Phone number (at least 10 digits) is required' });
    }
    
    // Validate MongoDB ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid ID', message: 'The provided Expert ID format is invalid' });
    }
    
    // Find the expert
    const expert = await Expert.findById(req.params.id);
    if (!expert) return res.status(404).json({ error: 'Not Found', message: 'Expert not found in database' });

    // Find the slot
    const slotIndex = expert.timeSlots.findIndex(s => s.id === slotId);
    if (slotIndex === -1) return res.status(404).json({ error: 'Not Found', message: 'The requested time slot does not exist for this expert' });

    const slot = expert.timeSlots[slotIndex];

    if (slot.isBooked) {
      return res.status(409).json({ error: 'Conflict', message: 'This slot has already been booked by another user' });
    }

    // Create the booking document
    const newBooking = new Booking({
      expertId: expert._id,
      expertName: expert.name,
      slotId: slot.id,
      date: slot.date,
      time: slot.time,
      userName,
      userEmail,
      userPhone,
      notes
    });
    
    await newBooking.save();

    // Mark as booked in the expert's array
    expert.timeSlots[slotIndex].isBooked = true;
    await expert.save();

    // Emit event via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('slotBooked', { expertId: expert._id, slotId });
    }

    res.json({ message: 'Booking successful', booking: newBooking });
  } catch (error) {
    console.error('Error booking slot:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
