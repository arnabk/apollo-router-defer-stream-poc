import React, { useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import ComparisonView from '../ComparisonView';
import QueryPanel from '../QueryPanel';
import LoadingCard from '../LoadingCard';
import '../../styles/Dashboard.css';

const DASHBOARD_QUERY_REGULAR = gql`
  query GetDashboard {
    dashboard {
      user {
        id
        name
        email
      }
      recentActivity {
        id
        type
        description
        timestamp
      }
      recommendations {
        id
        name
        price
      }
      notifications {
        id
        title
        message
        read
        timestamp
      }
    }
  }
`;

const DASHBOARD_QUERY_DEFER = gql`
  query GetDashboardDefer {
    dashboard {
      user {
        id
        name
        email
      }
      ... @defer {
        recentActivity {
          id
          type
          description
          timestamp
        }
      }
      ... @defer {
        recommendations {
          id
          name
          price
        }
      }
      ... @defer {
        notifications {
          id
          title
          message
          read
          timestamp
        }
      }
    }
  }
`;

function DashboardView({ dashboard, loading }) {
  if (!dashboard && !loading) return null;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome, {dashboard?.user?.name || 'Loading...'}!</h2>
        <p className="user-email">{dashboard?.user?.email || ''}</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          {loading && !dashboard?.recentActivity ? (
            <LoadingCard title="Recent Activity" />
          ) : dashboard?.recentActivity ? (
            <div className="activity-card">
              <h3>Recent Activity</h3>
              {dashboard.recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <span className="activity-icon">
                    {activity.type === 'post' ? '📝' : activity.type === 'comment' ? '💬' : '❤️'}
                  </span>
                  <div className="activity-content">
                    <p>{activity.description}</p>
                    <span className="activity-time">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="dashboard-section">
          {loading && !dashboard?.notifications ? (
            <LoadingCard title="Notifications" />
          ) : dashboard?.notifications ? (
            <div className="notifications-card">
              <h3>Notifications</h3>
              {dashboard.notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                >
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {new Date(notification.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {!notification.read && <span className="unread-badge">•</span>}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="dashboard-section full-width">
          {loading && !dashboard?.recommendations ? (
            <LoadingCard title="Recommendations" />
          ) : dashboard?.recommendations ? (
            <div className="dashboard-recommendations-card">
              <h3>Recommended for You</h3>
              <div className="recommendations-grid">
                {dashboard.recommendations.map((product) => (
                  <div key={product.id} className="recommendation-item">
                    <div className="recommendation-image">📦</div>
                    <h4>{product.name}</h4>
                    <p className="recommendation-price">${product.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DashboardDemo() {
  const [regularData, setRegularData] = useState(null);
  const [deferData, setDeferData] = useState(null);

  const [fetchRegular, { loading: regularLoading }] = useLazyQuery(DASHBOARD_QUERY_REGULAR, {
    fetchPolicy: 'network-only',
  });

  const [fetchDefer, { loading: deferLoading }] = useLazyQuery(DASHBOARD_QUERY_DEFER, {
    fetchPolicy: 'network-only',
  });

  const executeRegular = ({ onFirstData, onComplete }) => {
    setRegularData(null);
    let firstDataReceived = false;

    fetchRegular({
      onCompleted: (data) => {
        setRegularData(data.dashboard);
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
      onCompleted: (data) => {
        setDeferData(data.dashboard);
        
        if (!firstDataReceived && data.dashboard?.user) {
          onFirstData();
          firstDataReceived = true;
        }

        if (data.dashboard?.recentActivity && data.dashboard?.recommendations && data.dashboard?.notifications) {
          if (!completeDataReceived) {
            onComplete();
            completeDataReceived = true;
          }
        }
      },
    });
  };

  return (
    <ComparisonView title="Dashboard Query Comparison">
      <QueryPanel
        title="Regular Query"
        type="regular"
        onExecute={executeRegular}
      >
        <DashboardView dashboard={regularData} loading={regularLoading} />
      </QueryPanel>

      <QueryPanel
        title="Query with @defer"
        type="defer"
        onExecute={executeDefer}
      >
        <DashboardView dashboard={deferData} loading={deferLoading} />
      </QueryPanel>
    </ComparisonView>
  );
}

export default DashboardDemo;

