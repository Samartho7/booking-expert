const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Expert = require('./models/Expert');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bookingexpert';

const experts = [
  {
    name: 'Sarah Johnson',
    category: 'Technology',
    experience: '10 years',
    rating: 4.9,
    avatar: 'https://i.pravatar.cc/150?u=sarah'
  },
  {
    name: 'Michael Chen',
    category: 'Business',
    experience: '15 years',
    rating: 4.7,
    avatar: 'https://i.pravatar.cc/150?u=michael'
  },
  {
    name: 'Emma Williams',
    category: 'Design',
    experience: '8 years',
    rating: 4.8,
    avatar: 'https://i.pravatar.cc/150?u=emma'
  },
  {
    name: 'David Smith',
    category: 'Marketing',
    experience: '12 years',
    rating: 4.6,
    avatar: 'https://i.pravatar.cc/150?u=david'
  },
  {
    name: 'Jessica Lee',
    category: 'Technology',
    experience: '5 years',
    rating: 4.5,
    avatar: 'https://i.pravatar.cc/150?u=jessica'
  },
  {
    name: 'Robert Brown',
    category: 'Finance',
    experience: '20 years',
    rating: 4.9,
    avatar: 'https://i.pravatar.cc/150?u=robert'
  },
  {
    name: 'Sophia Patel',
    category: 'Health',
    experience: '7 years',
    rating: 4.8,
    avatar: 'https://i.pravatar.cc/150?u=sophia'
  },
  {
    name: 'James Wilson',
    category: 'Technology',
    experience: '14 years',
    rating: 4.7,
    avatar: 'https://i.pravatar.cc/150?u=james'
  },
  {
    name: 'Olivia Martinez',
    category: 'Design',
    experience: '6 years',
    rating: 4.6,
    avatar: 'https://i.pravatar.cc/150?u=olivia'
  },
  {
    name: 'William Taylor',
    category: 'Business',
    experience: '11 years',
    rating: 4.8,
    avatar: 'https://i.pravatar.cc/150?u=william'
  }
];

const generateTimeSlots = () => {
  const dates = [];
  const today = new Date();
  
  // Generate next 3 days
  for (let i = 1; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split('T')[0]); // YYYY-MM-DD
  }

  const times = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];
  const slots = [];

  dates.forEach(date => {
    times.forEach((time, index) => {
      // Randomly skip some slots so not every expert has the same availability
      if (Math.random() > 0.3) {
        slots.push({
          id: `${date}-${time.replace(' ', '')}-${index}`,
          date,
          time,
          isBooked: false
        });
      }
    });
  });

  return slots;
};

// Add random time slots to each expert
const expertsWithSlots = experts.map(expert => ({
  ...expert,
  timeSlots: generateTimeSlots()
}));

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await Expert.deleteMany({});
    await Expert.insertMany(expertsWithSlots);
    console.log('Seed data inserted');
    process.exit();
  })
  .catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
