const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  id: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  isBooked: { type: Boolean, default: false }
});

const expertSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  experience: { type: String, required: true },
  rating: { type: Number, required: true },
  avatar: { type: String, required: true },
  timeSlots: [timeSlotSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Expert', expertSchema);
