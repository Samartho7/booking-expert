import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ExpertListing from './pages/ExpertListing';
import ExpertDetail from './pages/ExpertDetail';
import BookingForm from './pages/BookingForm';
import MyBookings from './pages/MyBookings';
import { CalendarDays } from 'lucide-react';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="navbar container">
          <div className="nav-logo">
             <Link to="/">ExpertBook</Link>
          </div>
          <div className="nav-links">
             <Link to="/my-bookings" className="nav-link">
               <CalendarDays size={18}/> My Bookings
             </Link>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<ExpertListing />} />
          <Route path="/expert/:id" element={<ExpertDetail />} />
          <Route path="/book/:expertId/:slotId" element={<BookingForm />} />
          <Route path="/my-bookings" element={<MyBookings />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
