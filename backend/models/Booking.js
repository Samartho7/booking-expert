const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert', required: true },
  expertName: { type: String, required: true },
  slotId: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  userPhone: { type: String, required: true },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Completed'], default: 'Pending' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
