import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { getUser } from '../../utils/auth';
import './Tracker.css';

const Tracker = () => {
  const [trackerData, setTrackerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = getUser();
  const avatarUrl = user?.avatarUrl || '/Header_pic.jpg';

  useEffect(() => {
    fetchTrackerData();
  }, []);

  const fetchTrackerData = async () => {
    try {
      const res = await api.get('/tracker');
      setTrackerData(res.data);
    } catch (error) {
      console.error('Error fetching tracker data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="tracker-loading">Loading tracker...</div>;
  }

  if (!trackerData) {
    return <div className="tracker-loading">No data available</div>;
  }

  const stats = trackerData.stats || {};
  const totalTasks = stats.totalTasks || 0;
  const completedTasks = stats.completedTasks || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const tasksByStatus = stats.tasksByStatus || { todo: 0, 'in-progress': 0, completed: 0 };
  const tasksByPriority = stats.tasksByPriority || { low: 0, medium: 0, high: 0 };

  return (
    <div className="tracker">
      <div className="tracker-container">
        <div className="tracker-header">
          <h1>📊 Progress Tracker</h1>
          <p>Track your productivity and achievements</p>
        </div>

        <div className="tracker-profile">
          <div className="tracker-avatar" style={{ backgroundImage: `url(${avatarUrl})` }} />
          <div>
            <p className="label">Profile</p>
            <p className="value">{user?.username}</p>
            <span className={`pill ${user?.role === 'admin' ? 'pill-warn' : ''}`}>{user?.role}</span>
          </div>
        </div>

        <div className="tracker-stats-grid">
          <div className="tracker-stat-card main-stat">
            <div className="stat-header">
              <h2>Overall Progress</h2>
              <span className="stat-value-large">{completionRate}%</span>
            </div>
            <div className="circular-progress">
              <svg className="progress-ring" width="200" height="200">
                <circle
                  className="progress-ring-circle-bg"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="transparent"
                  r="85"
                  cx="100"
                  cy="100"
                />
                <circle
                  className="progress-ring-circle"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="transparent"
                  r="85"
                  cx="100"
                  cy="100"
                  strokeDasharray={`${2 * Math.PI * 85}`}
                  strokeDashoffset={`${2 * Math.PI * 85 * (1 - completionRate / 100)}`}
                  transform="rotate(-90 100 100)"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="progress-center">
                <span className="progress-number">{completedTasks}</span>
                <span className="progress-label">of {totalTasks} tasks</span>
              </div>
            </div>
          </div>

          <div className="tracker-stat-card streak-card">
            <div className="streak-icon">🔥</div>
            <div className="streak-content">
              <h3>Current Streak</h3>
              <p className="streak-number">{stats.streak || 0}</p>
              <p className="streak-label">days</p>
            </div>
          </div>

          <div className="tracker-stat-card">
            <h3>Projects</h3>
            <div className="stat-numbers">
              <div>
                <span className="number-large">{stats.totalProjects || 0}</span>
                <span className="number-label">Total</span>
              </div>
              <div>
                <span className="number-large">{stats.completedProjects || 0}</span>
                <span className="number-label">Completed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="tracker-charts">
          <div className="chart-card">
            <h3>Tasks by Status</h3>
            <div className="chart-container">
              <div className="chart-bar">
                <div className="bar-label">
                  <span>Todo</span>
                  <span className="bar-value">{tasksByStatus.todo}</span>
                </div>
                <div className="bar-track">
                  <div 
                    className="bar-fill bar-todo" 
                    style={{ width: `${totalTasks > 0 ? (tasksByStatus.todo / totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="chart-bar">
                <div className="bar-label">
                  <span>In Progress</span>
                  <span className="bar-value">{tasksByStatus['in-progress']}</span>
                </div>
                <div className="bar-track">
                  <div 
                    className="bar-fill bar-in-progress" 
                    style={{ width: `${totalTasks > 0 ? (tasksByStatus['in-progress'] / totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div className="chart-bar">
                <div className="bar-label">
                  <span>Completed</span>
                  <span className="bar-value">{tasksByStatus.completed}</span>
                </div>
                <div className="bar-track">
                  <div 
                    className="bar-fill bar-completed" 
                    style={{ width: `${totalTasks > 0 ? (tasksByStatus.completed / totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <h3>Tasks by Priority</h3>
            <div className="priority-stats">
              <div className="priority-item">
                <div className="priority-header">
                  <span className="priority-dot priority-low-dot"></span>
                  <span>Low</span>
                </div>
                <span className="priority-count">{tasksByPriority.low}</span>
              </div>
              <div className="priority-item">
                <div className="priority-header">
                  <span className="priority-dot priority-medium-dot"></span>
                  <span>Medium</span>
                </div>
                <span className="priority-count">{tasksByPriority.medium}</span>
              </div>
              <div className="priority-item">
                <div className="priority-header">
                  <span className="priority-dot priority-high-dot"></span>
                  <span>High</span>
                </div>
                <span className="priority-count">{tasksByPriority.high}</span>
              </div>
            </div>
          </div>
        </div>

        {trackerData.achievements && trackerData.achievements.length > 0 && (
          <div className="achievements-section">
            <h2>Achievements</h2>
            <div className="achievements-grid">
              {trackerData.achievements.map((achievement, index) => (
                <div key={index} className="achievement-card">
                  <div className="achievement-icon">🏆</div>
                  <h4>{achievement.name}</h4>
                  <p>{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tracker;

