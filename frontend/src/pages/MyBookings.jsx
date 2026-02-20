import React, { useState } from 'react';
import axios from 'axios';
import { Search, ChevronLeft, Calendar, Clock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const MyBookings = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/bookings?email=${encodeURIComponent(email)}`);
      setBookings(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'status-confirmed';
      case 'Completed': return 'status-completed';
      default: return 'status-pending';
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/api/bookings/${id}/status`, { status: newStatus });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking history?')) return;

    setDeletingId(id);
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/bookings/${id}`);
      setBookings(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete booking.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        <ChevronLeft size={20} /> Back
      </button>

      <header>
        <h1 style={{ fontSize: '2.5rem' }}>My Bookings</h1>
        <p className="subtitle">Enter your email to view your session history.</p>
      </header>

      <div className="bookings-search-wrapper">
        <form onSubmit={handleSearch} className="bookings-search-form">
          <input 
            type="email" 
            className="search-input"
            placeholder="Enter your email address..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="book-btn" style={{ width: 'auto', padding: '0.8rem 2rem' }} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {error ? (
        <div className="error-state">
          <p>{error}</p>
        </div>
      ) : searched && bookings.length === 0 && !loading ? (
        <div className="empty-state">
          <p>No bookings found for <strong>{email}</strong>.</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking._id} className="booking-card-item">
              <div className="booking-card-header">
                <div>
                  <h3>Session with {booking.expertName}</h3>
                  <span className={`status-badge ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
              <div className="booking-card-body">
                <div className="detail-item">
                  <Calendar size={16} />
                  <span>{new Date(booking.date).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <Clock size={16} />
                  <span>{booking.time}</span>
                </div>
                <div className="detail-item">
                  <User size={16} />
                  <span>Booked for: {booking.userName}</span>
                </div>
              </div>

              {/* Action buttons to toggle Status */}
              <div className="booking-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                {booking.status === 'Pending' && (
                  <button 
                    className="book-btn outline" 
                    style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                    disabled={updatingId === booking._id}
                    onClick={() => handleStatusUpdate(booking._id, 'Confirmed')}
                  >
                    Mark Confirmed
                  </button>
                )}
                {(booking.status === 'Pending' || booking.status === 'Confirmed') && (
                  <button 
                    className="book-btn" 
                    style={{ padding: '0.5rem', fontSize: '0.9rem' }}
                    disabled={updatingId === booking._id}
                    onClick={() => handleStatusUpdate(booking._id, 'Completed')}
                  >
                    Mark Completed
                  </button>
                )}
                {booking.status === 'Completed' && (
                  <button 
                    className="book-btn outline" 
                    style={{ padding: '0.5rem', fontSize: '0.9rem', borderColor: '#ef4444', color: '#ef4444' }}
                    disabled={deletingId === booking._id}
                    onClick={() => handleDelete(booking._id)}
                  >
                    {deletingId === booking._id ? 'Deleting...' : 'Delete Record'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
