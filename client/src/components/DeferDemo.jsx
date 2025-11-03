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

const USER_QUERY_STREAM = gql`
  query GetUserStream($id: ID!) {
    user(id: $id) {
      id
      name
      email
      posts @stream(initialCount: 0) {
        id
        title
        content
        likes
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
  const seenFields = useRef(new Set());

  const [streamChunks, setStreamChunks] = useState([]);
  const [streamStartTime, setStreamStartTime] = useState(null);
  const seenPostIds = useRef(new Set());

  const [fetchRegular, { loading: regularLoading }] = useLazyQuery(USER_QUERY_REGULAR, {
    fetchPolicy: 'network-only',
  });

  const [fetchDefer, { loading: deferLoading, data: deferData }] = useLazyQuery(USER_QUERY_DEFER, {
    fetchPolicy: 'network-only',
  });

  const [fetchStream, { loading: streamLoading, data: streamData }] = useLazyQuery(USER_QUERY_STREAM, {
    fetchPolicy: 'network-only',
  });

  // Watch for defer data changes
  useEffect(() => {
    if (!deferData?.user || !deferStartTime) return;

    const elapsed = Date.now() - deferStartTime;
    const currentData = deferData.user;

    // Check for initial data
    if (!seenFields.current.has('initial') && currentData.id) {
      seenFields.current.add('initial');
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
    }

    // Check for profile
    if (!seenFields.current.has('profile') && currentData.profile) {
      seenFields.current.add('profile');
      setDeferChunks(prev => [
        ...prev,
        { 
          time: elapsed, 
          label: '👤 Profile data received', 
          data: { profile: currentData.profile }
        }
      ]);
    }

    // Check for posts
    if (!seenFields.current.has('posts') && currentData.posts) {
      seenFields.current.add('posts');
      setDeferChunks(prev => [
        ...prev,
        { 
          time: elapsed, 
          label: '📝 Posts data received', 
          data: { posts: currentData.posts }
        }
      ]);
    }

    // Check for friends
    if (!seenFields.current.has('friends') && currentData.friends) {
      seenFields.current.add('friends');
      setDeferChunks(prev => [
        ...prev,
        { 
          time: elapsed, 
          label: '👥 Friends data received', 
          data: { friends: currentData.friends }
        }
      ]);
    }

    // Check for analytics
    if (!seenFields.current.has('analytics') && currentData.analytics) {
      seenFields.current.add('analytics');
      setDeferChunks(prev => [
        ...prev,
        { 
          time: elapsed, 
          label: '📊 Analytics data received', 
          data: { analytics: currentData.analytics }
        }
      ]);
    }
  }, [deferData, deferStartTime]);

  // Watch for stream data changes
  useEffect(() => {
    if (!streamData?.user || !streamStartTime) return;

    const elapsed = Date.now() - streamStartTime;
    const currentData = streamData.user;

    // Check for initial data
    if (!seenPostIds.current.has('initial') && currentData.id) {
      seenPostIds.current.add('initial');
      setStreamChunks(prev => [
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
    }

    // Check for each post individually
    if (currentData.posts && currentData.posts.length > 0) {
      currentData.posts.forEach((post) => {
        if (!seenPostIds.current.has(post.id)) {
          seenPostIds.current.add(post.id);
          setStreamChunks(prev => [
            ...prev,
            { 
              time: Date.now() - streamStartTime, 
              label: `📄 Post #${post.id}: "${post.title}"`, 
              data: { post }
            }
          ]);
        }
      });
    }
  }, [streamData, streamStartTime]);

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
    seenFields.current = new Set();
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

  const executeStream = () => {
    setStreamChunks([]);
    seenPostIds.current = new Set();
    const startTime = Date.now();
    setStreamStartTime(startTime);
    setExpandedPanel('stream');
    
    setStreamChunks([{ 
      time: 0, 
      label: '🚀 Query sent',
      data: null 
    }]);
    
    fetchStream({
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
        <p>👇 Click "Run" buttons to see @defer (chunks) vs @stream (list items) vs regular queries</p>
      </div>

      {/* Accordion Panels */}
      <div className="accordion">
        
        {/* Regular Query Accordion */}
        <div className={`accordion-item ${expandedPanel === 'regular' ? 'expanded' : ''}`}>
          <div className="accordion-header" onClick={() => togglePanel('regular')}>
            <div className="accordion-title">
              <span className="badge badge-regular">WITHOUT @defer/@stream</span>
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
              <h2>@defer - Loads Data Chunks Incrementally</h2>
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
                {deferLoading ? '⏳ Loading...' : '▶ Run @defer Query'}
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
                  <p>Click "Run @defer Query" to see incremental data loading</p>
                </div>
              )}
              {deferLoading && deferChunks.length > 0 && (
                <div className="loading-indicator">
                  <p>⏳ Waiting for more data chunks...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stream Query Accordion */}
        <div className={`accordion-item ${expandedPanel === 'stream' ? 'expanded' : ''}`}>
          <div className="accordion-header" onClick={() => togglePanel('stream')}>
            <div className="accordion-title">
              <span className="badge badge-stream">WITH @stream</span>
              <h2>@stream - Loads List Items One by One</h2>
            </div>
            <div className="accordion-actions">
              <button 
                className="run-button stream-button" 
                onClick={(e) => {
                  e.stopPropagation();
                  executeStream();
                }}
                disabled={streamLoading}
              >
                {streamLoading ? '⏳ Loading...' : '▶ Run @stream Query'}
              </button>
              <span className="expand-icon">{expandedPanel === 'stream' ? '▼' : '▶'}</span>
            </div>
          </div>
          
          {expandedPanel === 'stream' && (
            <div className="accordion-content">
              {streamChunks.map((chunk, idx) => (
                <div key={idx} className="data-chunk stream-chunk">
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
              {streamChunks.length === 0 && (
                <div className="empty-state">
                  <p>Click "Run @stream Query" to see list items loading one by one</p>
                </div>
              )}
              {streamLoading && streamChunks.length > 0 && (
                <div className="loading-indicator">
                  <p>⏳ Waiting for more list items...</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default DeferDemo;
