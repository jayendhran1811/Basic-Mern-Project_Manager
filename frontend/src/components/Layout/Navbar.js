import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { removeAuthToken, removeUser, getUser } from '../../utils/auth';
import './Navbar.css';

const Navbar = ({ setIsAuthenticated, theme, toggleTheme }) => {
  const location = useLocation();
  const user = useMemo(() => getUser(), []);
  const initial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

  const handleLogout = () => {
    removeAuthToken();
    removeUser();
    setIsAuthenticated(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          <span className="logo-icon">📊</span>
          <span className="logo-text">Project Management</span>
        </Link>
        <ul className="navbar-menu">
          <li>
            <Link 
              to="/dashboard" 
              className={location.pathname === '/dashboard' ? 'active' : ''}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/projects" 
              className={location.pathname === '/projects' ? 'active' : ''}
            >
              Projects
            </Link>
          </li>
          <li>
            <Link 
              to="/tracker" 
              className={location.pathname === '/tracker' ? 'active' : ''}
            >
              Tracker
            </Link>
          </li>
          <li>
            <Link 
              to="/settings" 
              className={location.pathname === '/settings' ? 'active' : ''}
            >
              Settings
            </Link>
          </li>
          <li className="navbar-user">
            <div className="user-chip">
              <span className="avatar">{initial}</span>
              <span className="user-name">{user?.username || 'User'}</span>
              <span className={`user-role ${user?.role === 'admin' ? 'role-admin' : 'role-user'}`}>
                {user?.role || 'user'}
              </span>
            </div>
            <button onClick={toggleTheme} className="theme-toggle" title="Toggle theme">
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

