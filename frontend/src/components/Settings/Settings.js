import React, { useEffect, useState } from 'react';
import { getUser } from '../../utils/auth';
import api from '../../utils/api';
import './Settings.css';

const Settings = ({ theme, toggleTheme }) => {
  const [profile, setProfile] = useState(getUser());
  const [users, setUsers] = useState([]);
  const [online, setOnline] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(getUser()?.avatarUrl || '/Header_pic.jpg');

  useEffect(() => {
    const fetchUsers = async () => {
      if (profile?.role !== 'admin') return;
      setLoadingUsers(true);
      try {
        const res = await api.get('/auth/users');
        setUsers(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users');
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [profile]);

  useEffect(() => {
    if (profile?.role !== 'admin') return;
    const loadOnline = async () => {
      try {
        const res = await api.get('/auth/online');
        setOnline(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load live tracker');
      }
    };
    loadOnline();
    const id = setInterval(loadOnline, 20000);
    return () => clearInterval(id);
  }, [profile]);

  const handleAvatarSave = () => {
    const updated = { ...profile, avatarUrl };
    setProfile(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <div>
            <p className="eyebrow">Settings</p>
            <h1>Control center</h1>
            <p className="subtitle">Manage preferences, theme, credits, and live status</p>
          </div>
          <div className="pill">{profile?.role || 'user'}</div>
        </div>

        <div className="settings-grid">
          <section className="settings-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Appearance</p>
                <h2>Theme</h2>
              </div>
            </div>
            <div className="theme-row">
              <div>
                <p className="label">Current theme</p>
                <p className="value">{theme === 'dark' ? 'Dark' : 'Light'}</p>
              </div>
              <button className="primary" onClick={toggleTheme}>
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>
          </section>

          <section className="settings-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Profile</p>
                <h2>Account info</h2>
              </div>
            </div>
            <div className="profile-block">
              <div className="avatar-row">
                <div className="settings-avatar" style={{ backgroundImage: `url(${avatarUrl})` }} />
                <div className="avatar-form">
                  <label className="label">Avatar image URL</label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                  />
                  <button className="primary ghost" type="button" onClick={handleAvatarSave}>
                    Save avatar
                  </button>
                  <p className="hint">Leave empty to use default.</p>
                </div>
              </div>
              <div className="profile-line">
                <span className="label">Name</span>
                <span className="value">{profile?.username}</span>
              </div>
              <div className="profile-line">
                <span className="label">Email</span>
                <span className="value">{profile?.email}</span>
              </div>
              <div className="profile-line">
                <span className="label">Role</span>
                <span className="value role">{profile?.role}</span>
              </div>
            </div>
          </section>

          <section className="settings-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Credits</p>
                <h2>Author & About</h2>
              </div>
            </div>
            <div className="about-block">
              <p className="value">Author: Your Name</p>
              <p className="muted">Building sleek, efficient product experiences.</p>
              <p className="label">About Us</p>
              <p className="muted">This platform helps teams manage projects, track productivity, and stay in sync.</p>
            </div>
            <div className="history">
              <p className="label">History</p>
              <ul>
                <li><strong>v1.1</strong> — Live tracker, theme toggle, credits</li>
                <li><strong>v1.0</strong> — Projects, tasks, tracker, auth</li>
              </ul>
            </div>
          </section>

          <section className="settings-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Notifications</p>
                <h2>Google Calendar</h2>
              </div>
            </div>
            <p className="muted">Connect Google Calendar to sync deadlines and reminders.</p>
            <button className="primary ghost" disabled title="Placeholder">
              Connect Google Calendar
            </button>
            <p className="hint">Requires Google OAuth setup. Add credentials to enable.</p>
          </section>

          {profile?.role === 'admin' && (
            <>
              <section className="settings-card">
                <div className="card-header">
                  <div>
                    <p className="eyebrow">Admin</p>
                    <h2>User directory</h2>
                  </div>
                </div>
                {loadingUsers ? (
                  <p>Loading users...</p>
                ) : error ? (
                  <p className="error">{error}</p>
                ) : (
                  <div className="user-list">
                    {users.map((u) => (
                      <div key={u._id} className="user-row">
                        <div>
                          <p className="value">{u.username}</p>
                          <p className="muted">{u.email}</p>
                        </div>
                        <span className={`pill ${u.role === 'admin' ? 'pill-warn' : ''}`}>{u.role}</span>
                      </div>
                    ))}
                    {users.length === 0 && <p className="muted">No users yet</p>}
                  </div>
                )}
              </section>

              <section className="settings-card">
                <div className="card-header">
                  <div>
                    <p className="eyebrow">Live tracker</p>
                    <h2>Online now</h2>
                  </div>
                </div>
                {error && <p className="error">{error}</p>}
                <div className="user-list">
                  {online.map((o) => (
                    <div key={o.userId} className="user-row">
                      <div>
                        <p className="value">{o.username}</p>
                        <p className="muted">{o.email}</p>
                      </div>
                      <span className={`pill ${o.role === 'admin' ? 'pill-warn' : ''}`}>{o.role}</span>
                    </div>
                  ))}
                  {online.length === 0 && <p className="muted">No one online in last 5 minutes</p>}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

