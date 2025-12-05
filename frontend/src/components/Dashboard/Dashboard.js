import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { getUser } from '../../utils/auth';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const userData = getUser();
      setUser(userData);

      const [projectsRes, trackerRes] = await Promise.all([
        api.get('/projects'),
        api.get('/tracker')
      ]);

      setRecentProjects(projectsRes.data.slice(0, 5));
      
      if (trackerRes.data.stats) {
        setStats(trackerRes.data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  const avatarUrl = user?.avatarUrl || '/Header_pic.jpg';

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.username || 'User'}! 👋</h1>
          <p>Here's your project overview</p>
        </div>

        <div className="profile-card">
          <div className="profile-left">
            <div className="profile-avatar" style={{ backgroundImage: `url(${avatarUrl})` }} />
            <div>
              <p className="label">Profile</p>
              <h3>{user?.username}</h3>
              <p className="muted">{user?.email}</p>
            </div>
          </div>
          <div className="profile-right">
            <span className={`pill ${user?.role === 'admin' ? 'pill-warn' : ''}`}>{user?.role || 'user'}</span>
            <div className="profile-meta">
              <div>
                <p className="label">Projects</p>
                <p className="value">{stats.totalProjects}</p>
              </div>
              <div>
                <p className="label">Tasks</p>
                <p className="value">{stats.totalTasks}</p>
              </div>
              <div>
                <p className="label">Completion</p>
                <p className="value">{completionRate}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📁</div>
            <div className="stat-content">
              <h3>{stats.totalProjects}</h3>
              <p>Total Projects</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.completedProjects}</h3>
              <p>Completed Projects</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <h3>{stats.totalTasks}</h3>
              <p>Total Tasks</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>{stats.completedTasks}</h3>
              <p>Completed Tasks</p>
            </div>
          </div>
        </div>

        <div className="progress-section">
          <h2>Overall Progress</h2>
          <div className="progress-card">
            <div className="progress-header">
              <span>Task Completion Rate</span>
              <span className="progress-percentage">{completionRate}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="recent-projects">
          <h2>Recent Projects</h2>
          {recentProjects.length === 0 ? (
            <div className="empty-state">
              <p>No projects yet. Create your first project to get started!</p>
            </div>
          ) : (
            <div className="projects-list">
              {recentProjects.map(project => (
                <div key={project._id} className="project-card">
                  <h3>{project.title}</h3>
                  <p>{project.description || 'No description'}</p>
                  <div className="project-meta">
                    <span className={`status-badge status-${project.status}`}>
                      {project.status}
                    </span>
                    <span className={`priority-badge priority-${project.priority}`}>
                      {project.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

