import React, { useState, useEffect, useRef } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import '../styles/DeferDemo.css';

const USER_QUERY_REGULAR = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      profile {
        avatar
        bio
        location
        website
      }
      posts {
        id
        title
        content
        likes
      }
      friends {
        id
        name
        email
      }
      analytics {
        totalPosts
        totalLikes
        totalComments
        engagementRate
      }
    }
  }
`;

const USER_QUERY_DEFER = gql`
  query GetUserDefer($id: ID!) {
    user(id: $id) {
      id
      name
      email
      ... @defer {
        profile {
          avatar
          bio
          location
          website
        }
      }
      ... @defer {
        posts {
          id
          title
          content
          likes
        }
      }
      ... @defer {
        friends {
          id
          name
          email
        }
      }
      ... @defer {
        analytics {
          totalPosts
          totalLikes
          totalComments
          engagementRate
        }
      }
    }
  }
`;

function DeferDemo() {
  const [expandedPanel, setExpandedPanel] = useState(null);
  
  const [regularChunks, setRegularChunks] = useState([]);
  const [regularStartTime, setRegularStartTime] = useState(null);
  
  const [deferChunks, setDeferChunks] = useState([]);
  const [deferStartTime, setDeferStartTime] = useState(null);
  const previousDeferData = useRef(null);

  const [fetchRegular, { loading: regularLoading }] = useLazyQuery(USER_QUERY_REGULAR, {
    fetchPolicy: 'network-only',
  });

  const [fetchDefer, { loading: deferLoading, data: deferData }] = useLazyQuery(USER_QUERY_DEFER, {
    fetchPolicy: 'network-only',
  });

  // Watch for defer data changes
  useEffect(() => {
    if (!deferData?.user || !deferStartTime) return;

    const elapsed = Date.now() - deferStartTime;
    const currentData = deferData.user;
    const prevData = previousDeferData.current;

    // First chunk - basic info
    if (!prevData) {
      setDeferChunks(prev => [
        ...prev,
        { 
          time: elapsed, 
          label: '⚡ Initial data (id, name, email)', 
          data: {
            id: currentData.id,
            name: currentData.name,
            email: currentData.email
          }
        }
      ]);
    } else {
      // Check for new data chunks
      if (currentData?.profile && !prevData?.profile) {
        setDeferChunks(prev => [
          ...prev,
          { 
            time: elapsed, 
            label: '👤 Profile data received', 
            data: { profile: currentData.profile }
          }
        ]);
      }
      if (currentData?.posts && !prevData?.posts) {
        setDeferChunks(prev => [
          ...prev,
          { 
            time: elapsed, 
            label: '📝 Posts data received', 
            data: { posts: currentData.posts }
          }
        ]);
      }
      if (currentData?.friends && !prevData?.friends) {
        setDeferChunks(prev => [
          ...prev,
          { 
            time: elapsed, 
            label: '👥 Friends data received', 
            data: { friends: currentData.friends }
          }
        ]);
      }
      if (currentData?.analytics && !prevData?.analytics) {
        setDeferChunks(prev => [
          ...prev,
          { 
            time: elapsed, 
            label: '📊 Analytics data received', 
            data: { analytics: currentData.analytics }
          }
        ]);
      }
    }

    previousDeferData.current = currentData;
  }, [deferData, deferStartTime]);

  const executeRegular = () => {
    setRegularChunks([]);
    const startTime = Date.now();
    setRegularStartTime(startTime);
    setExpandedPanel('regular');
    
    setRegularChunks([{ 
      time: 0, 
      label: '🚀 Query sent',
      data: null 
    }]);

    fetchRegular({
      variables: { id: '1' },
      onCompleted: (data) => {
        const elapsed = Date.now() - startTime;
        setRegularChunks(prev => [
          ...prev,
          { 
            time: elapsed, 
            label: '📦 All data received', 
            data: data.user 
          }
        ]);
      },
    });
  };

  const executeDefer = () => {
    setDeferChunks([]);
    previousDeferData.current = null;
    const startTime = Date.now();
    setDeferStartTime(startTime);
    setExpandedPanel('defer');
    
    setDeferChunks([{ 
      time: 0, 
      label: '🚀 Query sent',
      data: null 
    }]);
    
    fetchDefer({
      variables: { id: '1' },
    });
  };

  const togglePanel = (panel) => {
    setExpandedPanel(expandedPanel === panel ? null : panel);
  };

  return (
    <div className="defer-demo">
      
      {/* Info Banner */}
      <div className="info-banner">
        <p>👇 Click "Run" buttons below to see the difference. Watch how data appears!</p>
      </div>

      {/* Accordion Panels */}
      <div className="accordion">
        
        {/* Regular Query Accordion */}
        <div className={`accordion-item ${expandedPanel === 'regular' ? 'expanded' : ''}`}>
          <div className="accordion-header" onClick={() => togglePanel('regular')}>
            <div className="accordion-title">
              <span className="badge badge-regular">WITHOUT @defer</span>
              <h2>Regular Query - Waits for Everything</h2>
            </div>
            <div className="accordion-actions">
              <button 
                className="run-button regular-button" 
                onClick={(e) => {
                  e.stopPropagation();
                  executeRegular();
                }}
                disabled={regularLoading}
              >
                {regularLoading ? '⏳ Loading...' : '▶ Run Regular Query'}
              </button>
              <span className="expand-icon">{expandedPanel === 'regular' ? '▼' : '▶'}</span>
            </div>
          </div>
          
          {expandedPanel === 'regular' && (
            <div className="accordion-content">
              {regularChunks.map((chunk, idx) => (
                <div key={idx} className="data-chunk regular-chunk">
                  <div className="chunk-header">
                    <span className="chunk-time">{chunk.time}ms</span>
                    <span className="chunk-label">{chunk.label}</span>
                  </div>
                  {chunk.data && (
                    <div className="chunk-data">
                      <pre>{JSON.stringify(chunk.data, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))}
              {regularChunks.length === 0 && (
                <div className="empty-state">
                  <p>Click "Run Regular Query" to see how it loads all data at once</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Defer Query Accordion */}
        <div className={`accordion-item ${expandedPanel === 'defer' ? 'expanded' : ''}`}>
          <div className="accordion-header" onClick={() => togglePanel('defer')}>
            <div className="accordion-title">
              <span className="badge badge-defer">WITH @defer</span>
              <h2>Defer Query - Loads Incrementally</h2>
            </div>
            <div className="accordion-actions">
              <button 
                className="run-button defer-button" 
                onClick={(e) => {
                  e.stopPropagation();
                  executeDefer();
                }}
                disabled={deferLoading}
              >
                {deferLoading ? '⏳ Loading...' : '▶ Run Defer Query'}
              </button>
              <span className="expand-icon">{expandedPanel === 'defer' ? '▼' : '▶'}</span>
            </div>
          </div>
          
          {expandedPanel === 'defer' && (
            <div className="accordion-content">
              {deferChunks.map((chunk, idx) => (
                <div key={idx} className="data-chunk defer-chunk">
                  <div className="chunk-header">
                    <span className="chunk-time">{chunk.time}ms</span>
                    <span className="chunk-label">{chunk.label}</span>
                  </div>
                  {chunk.data && (
                    <div className="chunk-data">
                      <pre>{JSON.stringify(chunk.data, null, 2)}</pre>
                    </div>
                  )}
                </div>
              ))}
              {deferChunks.length === 0 && (
                <div className="empty-state">
                  <p>Click "Run Defer Query" to see incremental data loading</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Summary */}
      <div className="summary">
        <div className="summary-card">
          <h3>🔴 Without @defer</h3>
          <p>Server processes all data before responding. You wait ~15 seconds seeing nothing, then everything appears at once.</p>
        </div>
        <div className="summary-card">
          <h3>🟢 With @defer</h3>
          <p>Server sends critical data immediately (~100ms), then streams the rest every 2-5 seconds. You see data right away and it keeps arriving!</p>
        </div>
      </div>

    </div>
  );
}

export default DeferDemo;
