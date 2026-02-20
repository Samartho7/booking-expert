const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const Expert = require('./models/Expert');

mongoose.connect('mongodb://localhost:27017/bookingexpert')
  .then(async () => {
    // Re-sync all experts by unbooking slots that have no corresponding booking
    const experts = await Expert.find();
    let fixedAny = false;

    for (const expert of experts) {
      for (const slot of expert.timeSlots) {
        if (slot.isBooked) {
          // Check if a booking exists for this expert and slot
          const bookingExists = await Booking.exists({ expertId: expert._id, slotId: slot.id });
          if (!bookingExists) {
            console.log(`Slot ${slot.id} for Expert ${expert.name} is booked but no Booking exists. Fixing...`);
            slot.isBooked = false;
            fixedAny = true;
          }
        }
      }
      if (fixedAny) {
         await expert.save();
      }
    }

    console.log('Database synchronization complete.');
    mongoose.disconnect();
  });
