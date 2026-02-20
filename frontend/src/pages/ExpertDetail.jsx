import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { ChevronLeft, Star, Award, Calendar, Clock } from 'lucide-react';
import '../index.css';

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL;

const ExpertDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // 1. Fetch Expert Data
    const fetchExpert = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/experts/${id}`);
        setExpert(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch expert details.');
      } finally {
        setLoading(false);
      }
    };
    fetchExpert();

    // 2. Setup Socket.IO connection
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    // 3. Listen for booking events
    newSocket.on('slotBooked', ({ expertId, slotId }) => {
      if (expertId === id) {
        // Update the specific slot's isBooked status in real-time
        setExpert(prev => {
          if (!prev) return prev;
          const updatedSlots = prev.timeSlots.map(slot => 
            slot.id === slotId ? { ...slot, isBooked: true } : slot
          );
          return { ...prev, timeSlots: updatedSlots };
        });
      }
    });

    // 4. Listen for availability events (when a booking is completed or deleted)
    newSocket.on('slotAvailable', ({ expertId, slotId }) => {
      if (expertId === id) {
        // Free up the specific slot's isBooked status in real-time
        setExpert(prev => {
          if (!prev) return prev;
          const updatedSlots = prev.timeSlots.map(slot => 
            slot.id === slotId ? { ...slot, isBooked: false } : slot
          );
          return { ...prev, timeSlots: updatedSlots };
        });
      }
    });

    return () => newSocket.disconnect();
  }, [id]);

  const handleBookSlot = (slot) => {
    // Navigate to the booking form, passing context 
    navigate(`/book/${expert._id}/${slot.id}`, {
      state: {
        expertName: expert.name,
        date: slot.date,
        time: slot.time
      }
    });
  };

  if (loading) return (
    <div className="container">
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading expert profile...</p>
      </div>
    </div>
  );

  if (error || !expert) return (
    <div className="container">
      <div className="error-state">
        <p>{error || 'Expert not found.'}</p>
        <button className="book-btn" onClick={() => navigate('/')} style={{ marginTop: '1rem', width: 'auto' }}>
          Go Back
        </button>
      </div>
    </div>
  );

  // Group slots by Date
  const groupedSlots = expert.timeSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  return (
    <div className="container detail-container">
      <button className="back-btn" onClick={() => navigate('/')}>
        <ChevronLeft size={20} /> Back to Experts
      </button>

      <div className="expert-detail-card">
        <div className="expert-detail-header">
          <img src={expert.avatar} alt={expert.name} className="expert-detail-avatar" />
          <div className="expert-detail-info">
            <h2>{expert.name}</h2>
            <span className="expert-category">{expert.category}</span>
            <div className="expert-details-row">
               <div className="detail-item">
                  <Award size={18} />
                  <span>{expert.experience} Experience</span>
               </div>
               <div className="detail-item">
                  <Star size={18} className="rating-star" fill="currentColor" />
                  <span>{expert.rating.toFixed(1)} Rating</span>
               </div>
            </div>
          </div>
        </div>

        <div className="schedule-section">
          <h3><Calendar size={20} /> Available Sessions</h3>
          {Object.keys(groupedSlots).length === 0 ? (
            <p className="no-slots">No upcoming sessions available.</p>
          ) : (
            Object.entries(groupedSlots).map(([date, slots]) => (
              <div key={date} className="date-group">
                <h4 className="date-header">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h4>
                <div className="slots-grid">
                  {slots.map(slot => (
                    <button
                      key={slot.id}
                      className={`slot-btn ${slot.isBooked ? 'booked' : 'available'}`}
                      onClick={() => handleBookSlot(slot)}
                      disabled={slot.isBooked}
                    >
                      <Clock size={16} />
                      {slot.time}
                      {slot.isBooked && ' (Booked)'}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertDetail;
