import React from 'react';
import '../styles/ComparisonView.css';

function ComparisonView({ children, title }) {
  return (
    <div className="comparison-view">
      <h2 className="comparison-title">{title}</h2>
      <div className="comparison-grid">
        {children}
      </div>
    </div>
  );
}

export default ComparisonView;

