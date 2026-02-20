import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Calendar, Clock, User, Mail, Phone, CheckCircle } from 'lucide-react';
import '../index.css';

const BookingForm = () => {
  const { expertId, slotId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Try to get pre-fetched details from the Detail view, or fallback
  const preFilledSlotContext = location.state;
  
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!formData.userName || !formData.userEmail || !formData.userPhone) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.userEmail)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/experts/${expertId}/book`, {
        slotId,
        ...formData
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book slot. It might already be taken.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container">
        <div className="success-overlay">
          <CheckCircle size={64} className="success-icon" />
          <h2>Booking Confirmed!</h2>
          <p>Your session has been successfully booked.</p>
          <div className="success-actions">
            <button className="book-btn" onClick={() => navigate('/my-bookings')}>View My Bookings</button>
            <button className="book-btn outline" onClick={() => navigate('/')}>Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container booking-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ChevronLeft size={20} /> Back
      </button>

      <div className="booking-card">
        <h2>Complete Your Booking</h2>
        
        {preFilledSlotContext && (
          <div className="booking-context">
            <div className="context-item">
              <User size={18} />
              <span>Expert: <strong>{preFilledSlotContext.expertName}</strong></span>
            </div>
            <div className="context-item">
              <Calendar size={18} />
              <span>Date: <strong>{new Date(preFilledSlotContext.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</strong></span>
            </div>
            <div className="context-item">
              <Clock size={18} />
              <span>Time: <strong>{preFilledSlotContext.time}</strong></span>
            </div>
          </div>
        )}

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label>Full Name *</label>
            <div className="input-with-icon">
              <User size={18} />
              <input 
                type="text" 
                name="userName" 
                value={formData.userName}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input 
                type="email" 
                name="userEmail" 
                value={formData.userEmail}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <div className="input-with-icon">
              <Phone size={18} />
              <input 
                type="tel" 
                name="userPhone" 
                value={formData.userPhone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Session Notes (Optional)</label>
            <textarea 
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="What would you like to discuss?"
              rows="4"
            />
          </div>

          <button type="submit" className="book-btn submit-btn" disabled={loading}>
            {loading ? 'Confirming...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
