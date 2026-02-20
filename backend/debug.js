const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Expert = require('./models/Expert');

mongoose.connect('mongodb://localhost:27017/bookingexpert')
  .then(async () => {
    const experts = await Expert.find({ 'timeSlots.isBooked': true });
    console.log('Experts with booked slots:', JSON.stringify(experts, null, 2));

    const bookings = await Booking.find();
    console.log('Bookings:', JSON.stringify(bookings, null, 2));

    mongoose.disconnect();
  });
