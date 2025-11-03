import React from 'react';
import '../styles/LoadingCard.css';

function LoadingCard({ title }) {
  return (
    <div className="loading-card">
      <div className="loading-card-header">
        <div className="loading-shimmer loading-title"></div>
      </div>
      <div className="loading-card-body">
        <div className="loading-shimmer loading-line"></div>
        <div className="loading-shimmer loading-line short"></div>
      </div>
    </div>
  );
}

export default LoadingCard;

