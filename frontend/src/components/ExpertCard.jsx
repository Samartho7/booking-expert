import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Award, ChevronRight } from 'lucide-react';

const ExpertCard = ({ expert }) => {
  const navigate = useNavigate();

  return (
    <div className="expert-card">
      <div className="expert-card-header">
        <img src={expert.avatar} alt={expert.name} className="expert-avatar" />
        <div className="expert-info">
          <h3>{expert.name}</h3>
          <span className="expert-category">{expert.category}</span>
        </div>
      </div>
      
      <div className="expert-details">
        <div className="detail-item">
          <Award size={16} />
          <span>{expert.experience}</span>
        </div>
        <div className="detail-item">
          <Star size={16} className="rating-star" fill="currentColor" />
          <span>{expert.rating.toFixed(1)}</span>
        </div>
      </div>
      
      <button 
        className="book-btn"
        onClick={() => navigate(`/expert/${expert._id}`)}
      >
        View Available Sessions
      </button>
    </div>
  );
};

export default ExpertCard;
