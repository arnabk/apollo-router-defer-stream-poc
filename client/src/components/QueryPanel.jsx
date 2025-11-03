import React, { useState, useEffect } from 'react';
import '../styles/QueryPanel.css';

function QueryPanel({ title, type, onExecute, children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [firstDataTime, setFirstDataTime] = useState(null);
  const [completeTime, setCompleteTime] = useState(null);

  const handleExecute = () => {
    setIsLoading(true);
    setStartTime(Date.now());
    setFirstDataTime(null);
    setCompleteTime(null);
    onExecute({
      onFirstData: () => setFirstDataTime(Date.now()),
      onComplete: () => {
        setCompleteTime(Date.now());
        setIsLoading(false);
      },
    });
  };

  const getTimings = () => {
    if (!startTime) return null;
    const timings = {};
    if (firstDataTime) {
      timings.firstData = firstDataTime - startTime;
    }
    if (completeTime) {
      timings.total = completeTime - startTime;
    }
    return timings;
  };

  const timings = getTimings();

  return (
    <div className={`query-panel ${type}`}>
      <div className="panel-header">
        <h3 className="panel-title">{title}</h3>
        <span className={`panel-badge ${type}`}>
          {type === 'regular' ? 'Standard Query' : 'With @defer'}
        </span>
      </div>

      <button
        className="execute-button"
        onClick={handleExecute}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Run Query'}
      </button>

      {timings && (
        <div className="timing-display">
          {timings.firstData && (
            <div className="timing-item first-data">
              <span className="timing-label">First Data:</span>
              <span className="timing-value">{timings.firstData}ms</span>
            </div>
          )}
          {timings.total && (
            <div className="timing-item total">
              <span className="timing-label">Total Time:</span>
              <span className="timing-value">{timings.total}ms</span>
            </div>
          )}
          {type === 'defer' && timings.firstData && timings.total && (
            <div className="timing-benefit">
              ⚡ {((1 - timings.firstData / timings.total) * 100).toFixed(0)}% faster initial render
            </div>
          )}
        </div>
      )}

      <div className="panel-content">
        {children}
      </div>
    </div>
  );
}

export default QueryPanel;

