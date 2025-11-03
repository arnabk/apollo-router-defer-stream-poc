import React from 'react';
import '../styles/DemoSelector.css';

const demos = [
  { id: 'user-profile', name: 'User Profile', icon: '👤' },
  { id: 'product-page', name: 'Product Page', icon: '🛍️' },
  { id: 'dashboard', name: 'Dashboard', icon: '📊' },
];

function DemoSelector({ selectedDemo, onSelect }) {
  return (
    <div className="demo-selector">
      <div className="demo-selector-content">
        {demos.map((demo) => (
          <button
            key={demo.id}
            className={`demo-button ${selectedDemo === demo.id ? 'active' : ''}`}
            onClick={() => onSelect(demo.id)}
          >
            <span className="demo-icon">{demo.icon}</span>
            <span className="demo-name">{demo.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default DemoSelector;

