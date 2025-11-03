import React, { useState } from 'react';
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
  const [regularData, setRegularData] = useState(null);
  const [regularTimeline, setRegularTimeline] = useState([]);
  const [regularStartTime, setRegularStartTime] = useState(null);
  
  const [deferData, setDeferData] = useState(null);
  const [deferTimeline, setDeferTimeline] = useState([]);
  const [deferStartTime, setDeferStartTime] = useState(null);

  const [fetchRegular, { loading: regularLoading }] = useLazyQuery(USER_QUERY_REGULAR, {
    fetchPolicy: 'network-only',
  });

  const [fetchDefer, { loading: deferLoading }] = useLazyQuery(USER_QUERY_DEFER, {
    fetchPolicy: 'network-only',
  });

  const executeRegular = () => {
    setRegularData(null);
    setRegularTimeline([]);
    const startTime = Date.now();
    setRegularStartTime(startTime);
    
    setRegularTimeline([{ time: 0, event: 'Query sent to server' }]);

    fetchRegular({
      variables: { id: '1' },
      onCompleted: (data) => {
        const elapsed = Date.now() - startTime;
        setRegularData(data.user);
        setRegularTimeline(prev => [
          ...prev,
          { time: elapsed, event: 'All data received at once', data: data.user }
        ]);
      },
    });
  };

  const executeDefer = () => {
    setDeferData(null);
    setDeferTimeline([]);
    const startTime = Date.now();
    setDeferStartTime(startTime);
    
    setDeferTimeline([{ time: 0, event: 'Query sent to server' }]);
    
    let updateCount = 0;

    fetchDefer({
      variables: { id: '1' },
      onCompleted: (data) => {
        updateCount++;
        const elapsed = Date.now() - startTime;
        
        setDeferData(data.user);
        
        // Determine what just arrived
        let event = 'Data chunk received';
        if (updateCount === 1) {
          event = 'Initial data (id, name, email)';
        } else if (data.user?.profile && !deferData?.profile) {
          event = 'Profile data received';
        } else if (data.user?.posts && !deferData?.posts) {
          event = 'Posts data received';
        } else if (data.user?.friends && !deferData?.friends) {
          event = 'Friends data received';
        } else if (data.user?.analytics && !deferData?.analytics) {
          event = 'Analytics data received';
        }

        setDeferTimeline(prev => [
          ...prev,
          { time: elapsed, event, data: data.user }
        ]);
      },
    });
  };

  return (
    <div className="defer-demo">
      <div className="comparison-container">
        
        {/* Regular Query Panel */}
        <div className="panel regular-panel">
          <div className="panel-header">
            <h2>❌ Without @defer</h2>
            <p>Waits for ALL data before showing anything</p>
          </div>
          
          <button 
            className="run-button regular-button" 
            onClick={executeRegular}
            disabled={regularLoading}
          >
            {regularLoading ? 'Loading...' : 'Run Regular Query'}
          </button>

          <div className="timeline">
            <h3>Timeline:</h3>
            {regularTimeline.map((item, idx) => (
              <div key={idx} className="timeline-item">
                <span className="time">{item.time}ms</span>
                <span className="event">{item.event}</span>
              </div>
            ))}
          </div>

          {regularData && (
            <div className="data-container">
              <h3>Response Data (all at once):</h3>
              <pre className="json-data">
                {JSON.stringify(regularData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Defer Query Panel */}
        <div className="panel defer-panel">
          <div className="panel-header">
            <h2>✅ With @defer</h2>
            <p>Shows data incrementally as it arrives</p>
          </div>
          
          <button 
            className="run-button defer-button" 
            onClick={executeDefer}
            disabled={deferLoading}
          >
            {deferLoading ? 'Loading...' : 'Run Query with @defer'}
          </button>

          <div className="timeline">
            <h3>Timeline:</h3>
            {deferTimeline.map((item, idx) => (
              <div key={idx} className="timeline-item incremental">
                <span className="time">{item.time}ms</span>
                <span className="event">{item.event}</span>
              </div>
            ))}
          </div>

          {deferData && (
            <div className="data-container">
              <h3>Response Data (incremental updates):</h3>
              <pre className="json-data">
                {JSON.stringify(deferData, null, 2)}
              </pre>
            </div>
          )}
        </div>

      </div>

      <div className="explanation">
        <h3>Key Differences:</h3>
        <ul>
          <li><strong>Without @defer:</strong> The server waits for ALL data to be ready (~3600ms), then sends everything at once. User sees nothing until all data arrives.</li>
          <li><strong>With @defer:</strong> The server sends critical data immediately (~100ms), then streams the rest as it becomes available. User sees data right away!</li>
        </ul>
      </div>
    </div>
  );
}

export default DeferDemo;

