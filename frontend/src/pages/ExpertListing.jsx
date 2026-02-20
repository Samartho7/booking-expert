import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react';
import ExpertCard from '../components/ExpertCard';
import Pagination from '../components/Pagination';

const CATEGORIES = ['All', 'Technology', 'Business', 'Design', 'Marketing', 'Health', 'Finance'];

const ExpertListing = () => {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  useEffect(() => {
    const fetchExperts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/experts`, {
          params: { page, limit, search, category }
        });
        setExperts(res.data.experts);
        setTotalPages(res.data.pages);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch experts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchExperts();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category, page]);

  // Reset page relative to search/category changes
  useEffect(() => {
    setPage(1);
  }, [search, category]);

  return (
    <div className="container">
      <header>
        <h1>Find Your Expert</h1>
        <p className="subtitle">Book 1-on-1 real-time sessions with top industry leaders.</p>
      </header>

      <div className="controls">
        <div className="search-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder="Search experts by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <select
          className="category-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {CATEGORIES.map(cat => (
             <option key={cat} value={cat}>{cat} Experts</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading premium experts...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
        </div>
      ) : experts.length === 0 ? (
        <div className="empty-state">
          <p>No experts found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="experts-grid">
            {experts.map((expert) => (
              <ExpertCard key={expert._id} expert={expert} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ExpertListing;
