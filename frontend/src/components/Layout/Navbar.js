import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  Settings as SettingsIcon,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Sun,
  Moon,
  Bell,
  BarChart3
} from 'lucide-react';
import './Navbar.css';
import NotificationCenter from './NotificationCenter';

const Navbar = ({ sidebarOpen, setSidebarOpen, isDarkMode, toggleTheme }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, designations: ['Manager', 'Business Analyst', 'Business Development', 'Team Lead', 'Developer', 'DevOps', 'Tester'] },
    { path: '/projects', label: 'Projects', icon: Briefcase, designations: ['Manager', 'Business Analyst', 'Business Development', 'Team Lead', 'Developer', 'DevOps', 'Tester'] },
    { path: '/tasks', label: 'Tasks', icon: CheckSquare, designations: ['Manager', 'Business Analyst', 'Business Development', 'Team Lead', 'Developer', 'DevOps', 'Tester'] },
    { path: '/reports', label: 'Reports', icon: BarChart3, designations: ['Manager', 'Business Analyst', 'Business Development', 'Team Lead', 'Developer', 'DevOps', 'Tester'] },
    { path: '/admin', label: 'Admin', icon: ShieldCheck, designations: ['Manager'] },
    { path: '/settings', label: 'Settings', icon: SettingsIcon, designations: ['Manager', 'Business Analyst', 'Business Development', 'Team Lead', 'Developer', 'DevOps', 'Tester'] },
  ];

  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <Link to="/dashboard" className="sidebar-logo">
          <LayoutDashboard className="logo-icon" size={24} />
          {sidebarOpen && <span className="logo-text">PRO MANAGER</span>}
        </Link>
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.filter(item => item.designations.includes(user.designation)).map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                title={item.label}
              >
                <item.icon className="nav-icon" size={20} />
                {sidebarOpen && <span className="nav-label">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        {/* Theme Toggle Slider */}
        <div className={`theme-switcher-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
          {sidebarOpen && <span className="theme-label">{isDarkMode ? 'Night Mode' : 'Day Mode'}</span>}
          <div className="theme-slider-wrapper" onClick={toggleTheme}>
            <div className={`theme-slider ${isDarkMode ? 'dark' : 'light'}`}>
              <div className="slider-handle">
                {isDarkMode ? <Moon size={12} fill="currentColor" /> : <Sun size={12} fill="currentColor" />}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications (Mainly for Manager) */}
        {user.designation === 'Manager' && (
          <div className={`notification-sidebar-item ${!sidebarOpen ? 'collapsed' : ''}`}>
            <NotificationCenter isDarkMode={isDarkMode} />
            {sidebarOpen && <span className="nav-label">Monitor Updates</span>}
          </div>
        )}

        <div className={`user-profile ${!sidebarOpen ? 'collapsed' : ''}`}>
          <div className="user-avatar">
            {user.firstName ? (
              <span>{user.firstName[0]}{user.lastName?.[0]}</span>
            ) : (
              <User size={20} />
            )}
          </div>
          {sidebarOpen && (
            <div className="user-details">
              <div className="user-name">{user.firstName} {user.lastName}</div>
              <div className="user-role">{user.designation}</div>
            </div>
          )}
        </div>
        <button
          className="nav-link logout-btn"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut className="nav-icon" size={20} />
          {sidebarOpen && <span className="nav-label">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Navbar;

