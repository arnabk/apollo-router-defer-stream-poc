import React, { useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import ComparisonView from '../ComparisonView';
import QueryPanel from '../QueryPanel';
import LoadingCard from '../LoadingCard';
import '../../styles/UserProfile.css';

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
        createdAt
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
          createdAt
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

function UserCard({ user, loading }) {
  if (!user && !loading) return null;

  return (
    <div className="user-profile">
      <div className="user-basic-info">
        <div className="user-avatar-placeholder">
          {user?.name?.[0] || '?'}
        </div>
        <div className="user-info">
          <h2>{user?.name || 'Loading...'}</h2>
          <p>{user?.email || 'Loading...'}</p>
        </div>
      </div>

      {loading && !user?.profile ? (
        <LoadingCard title="Profile" />
      ) : user?.profile ? (
        <div className="profile-card">
          <h3>Profile</h3>
          <p>{user.profile.bio}</p>
          <p>📍 {user.profile.location}</p>
          {user.profile.website && <p>🔗 {user.profile.website}</p>}
        </div>
      ) : null}

      {loading && !user?.posts ? (
        <LoadingCard title="Posts" />
      ) : user?.posts ? (
        <div className="posts-card">
          <h3>Posts ({user.posts.length})</h3>
          {user.posts.map((post) => (
            <div key={post.id} className="post-item">
              <h4>{post.title}</h4>
              <p className="post-meta">❤️ {post.likes} likes</p>
            </div>
          ))}
        </div>
      ) : null}

      {loading && !user?.friends ? (
        <LoadingCard title="Friends" />
      ) : user?.friends ? (
        <div className="friends-card">
          <h3>Friends ({user.friends.length})</h3>
          {user.friends.map((friend) => (
            <div key={friend.id} className="friend-item">
              <div className="friend-avatar">{friend.name[0]}</div>
              <span>{friend.name}</span>
            </div>
          ))}
        </div>
      ) : null}

      {loading && !user?.analytics ? (
        <LoadingCard title="Analytics" />
      ) : user?.analytics ? (
        <div className="analytics-card">
          <h3>Analytics</h3>
          <div className="analytics-grid">
            <div className="stat">
              <div className="stat-value">{user.analytics.totalPosts}</div>
              <div className="stat-label">Posts</div>
            </div>
            <div className="stat">
              <div className="stat-value">{user.analytics.totalLikes}</div>
              <div className="stat-label">Likes</div>
            </div>
            <div className="stat">
              <div className="stat-value">{user.analytics.totalComments}</div>
              <div className="stat-label">Comments</div>
            </div>
            <div className="stat">
              <div className="stat-value">{user.analytics.engagementRate.toFixed(1)}</div>
              <div className="stat-label">Engagement</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function UserProfileDemo() {
  const [regularData, setRegularData] = useState(null);
  const [deferData, setDeferData] = useState(null);

  const [fetchRegular, { loading: regularLoading }] = useLazyQuery(USER_QUERY_REGULAR, {
    fetchPolicy: 'network-only',
  });

  const [fetchDefer, { loading: deferLoading }] = useLazyQuery(USER_QUERY_DEFER, {
    fetchPolicy: 'network-only',
  });

  const executeRegular = ({ onFirstData, onComplete }) => {
    setRegularData(null);
    let firstDataReceived = false;

    fetchRegular({
      variables: { id: '1' },
      onCompleted: (data) => {
        setRegularData(data.user);
        if (!firstDataReceived) {
          onFirstData();
          firstDataReceived = true;
        }
        onComplete();
      },
    });
  };

  const executeDefer = ({ onFirstData, onComplete }) => {
    setDeferData(null);
    let firstDataReceived = false;
    let completeDataReceived = false;

    fetchDefer({
      variables: { id: '1' },
      onCompleted: (data) => {
        setDeferData(data.user);
        
        if (!firstDataReceived && data.user) {
          onFirstData();
          firstDataReceived = true;
        }

        // Check if all deferred data is loaded
        if (data.user?.profile && data.user?.posts && data.user?.friends && data.user?.analytics) {
          if (!completeDataReceived) {
            onComplete();
            completeDataReceived = true;
          }
        }
      },
    });
  };

  return (
    <ComparisonView title="User Profile Query Comparison">
      <QueryPanel
        title="Regular Query"
        type="regular"
        onExecute={executeRegular}
      >
        <UserCard user={regularData} loading={regularLoading} />
      </QueryPanel>

      <QueryPanel
        title="Query with @defer"
        type="defer"
        onExecute={executeDefer}
      >
        <UserCard user={deferData} loading={deferLoading} />
      </QueryPanel>
    </ComparisonView>
  );
}

export default UserProfileDemo;

