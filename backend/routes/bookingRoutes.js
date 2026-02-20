const express = require('express');
const Booking = require('../models/Booking');
const Expert = require('../models/Expert');

const router = express.Router();

// GET /api/bookings
// Query params: email
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Validation Error', message: 'Email query parameter is required to track bookings.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Validation Error', message: 'The provided email is invalid.' });
    }

    const bookings = await Booking.find({ userEmail: email }).sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Server Error', message: 'An unexpected error occurred while fetching your bookings.' });
  }
});

// PATCH /api/bookings/:id/status
// Body: { status: 'Confirmed' | 'Completed' | 'Pending' }
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Completed'];

    if (!validStatuses.includes(status)) {
       return res.status(400).json({ error: 'Validation Error', message: 'Invalid status provided.' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Not Found', message: 'Booking not found.' });
    }

    booking.status = status;
    await booking.save();

    // If the booking is completed, free up the expert's slot so it can be booked again
    if (status === 'Completed') {
      const expert = await Expert.findById(booking.expertId);
      if (expert) {
        const slotIndex = expert.timeSlots.findIndex(s => s.id === booking.slotId);
        if (slotIndex !== -1) {
          expert.timeSlots[slotIndex].isBooked = false;
          await expert.save();
          
          // Emit socket event to update clients immediately
          const io = req.app.get('io');
          if (io) {
            io.emit('slotAvailable', { expertId: expert._id, slotId: booking.slotId });
          }
        }
      }
    }

    res.json({ message: 'Booking status updated successfully', booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Server Error', message: 'An unexpected error occurred while updating the booking.' });
  }
});

// DELETE /api/bookings/:id
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ error: 'Not Found', message: 'Booking not found.' });
    }

    // Optional: Could add an authorization or check here if it must be 'Completed' first
    // if (booking.status !== 'Completed') {
    //   return res.status(400).json({ error: 'Validation Error', message: 'Only completed bookings can be deleted.' });
    // }

    await Booking.findByIdAndDelete(req.params.id);

    // Free up the expert's slot if the booking was deleted before it was completed
    const expert = await Expert.findById(booking.expertId);
    if (expert) {
      const slotIndex = expert.timeSlots.findIndex(s => s.id === booking.slotId);
      if (slotIndex !== -1) {
        expert.timeSlots[slotIndex].isBooked = false;
        await expert.save();
        
        // Emit socket event to update clients immediately
        const io = req.app.get('io');
        if (io) {
          io.emit('slotAvailable', { expertId: expert._id, slotId: booking.slotId });
        }
      }
    }

    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Server Error', message: 'An unexpected error occurred while deleting the booking.' });
  }
});

module.exports = router;
