# Real-Time Expert Session Booking System

A full-stack web application designed to connect users with experts across various fields. The platform allows users to browse experts, view their availability in real-time, and seamlessly book application sessions. Featuring a sleek, premium dark-mode UI with glassmorphism aesthetics.

## 🚀 Features

### User-Facing Features
- **Expert Discovery:** Browse experts with pagination, search by name, and filter by category (e.g., Technology, Health, Finance).
- **Dynamic Scheduling:** View available time slots for specific experts, grouped cleanly by date.
- **Real-Time WebSockets:** Instantly see when a slot is booked by someone else globally—no page refresh required! Time slots react instantaneously.
- **Booking Flow:** Fill out a quick form with validation to secure a slot.
- **Booking Management:** Access the "My Bookings" portal via email lookup to track session statuses (Pending, Confirmed, Completed).
- **Clean Up:** Users can delete their completed booking records, which automatically re-opens the original slot for the expert in real-time.

### Technical & Admin Features
- **Robust Error Handling:** Strict backend validation returning clear JSON error messages for missing fields, invalid formats, or missing documents.
- **Environment Context:** Configurable `.env` files for both frontend (`VITE_API_URL`) and backend (`PORT`, `MONGO_URI`).
- **Data Seeding:** Built-in `seed.js` script to quickly populate MongoDB with expert profiles and time slots.

## 🛠️ Tech Stack

**Frontend:**
- React (bootstrapped with Vite)
- Vanilla CSS (Custom dark theme, Flexbox/Grid, Glassmorphism)
- React Router DOM
- Axios (HTTP client)
- Socket.IO Client
- Lucide React (Icons)

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose (Object Data Modeling)
- Socket.IO (Real-time bi-directional event-based communication)
- Dotenv (Environment variable management)
- CORS

## ⚙️ Installation & Setup

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally on port `27017`)

### 1. Clone the Repository
```bash
git clone https://github.com/Samartho7/booking-expert.git
cd booking-expert
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/bookingexpert
```

Seed the database with sample experts and time slots:
```bash
node seed.js
```

Start the backend server:
```bash
node server.js
# Or use nodemon for auto-reloading if you have it installed
```

### 3. Frontend Setup
Open a new terminal window/tab:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000
```

Start the Vite development server:
```bash
npm run dev
```

### 4. View the App
Navigate to `http://localhost:5173` in your browser to explore the app!

## 💡 How It Works (Real-Time Booking)
1. User A and User B are both viewing the same Expert's calendar.
2. User A clicks an available 11:00 AM slot and completes the booking form.
3. The Express routing validates the input and saves the specific `Booking` document to MongoDB, simultaneously marking that Expert's targeted `timeSlot` as `isBooked: true`.
4. The backend immediately fires a `slotBooked` broadcast via `socket.io`.
5. User B's browser instantly receives this socket event and disables the 11:00 AM slot on their screen in real-time, preventing double-bookings.
6. If User A later deletes their completed booking tracking record, a `slotAvailable` event is fired securely re-opening the slot globally!

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
