import React, { useEffect, useState } from 'react';
import {
  User,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Calendar as CalendarIcon,
  Shield,
  Info,
  History,
  Mail,
  Save,
  Users,
  Activity,
  GitBranch,
  Lock,
  Github,
  Copy,
  Check,
  UserPlus,
  Image,
  Phone,
  Pencil,
  X
} from 'lucide-react';
import { getUser } from '../../utils/auth';
import { authAPI } from '../../utils/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import './Settings.css';

const Settings = ({ isDarkMode, toggleTheme }) => {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState(authUser || getUser());
  const [users, setUsers] = useState([]);
  const [online, setOnline] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Sync with AuthContext user when it loads
  useEffect(() => {
    if (authUser) {
      setProfile(authUser);
      setAvatarUrl(authUser.avatarUrl || '');
      setPhoneNumber(authUser.phoneNumber || '');
    }
  }, [authUser]);
  const [bitbucketConfig, setBitbucketConfig] = useState({
    workspace: '',
    apiToken: ''
  });
  const [savingBitbucket, setSavingBitbucket] = useState(false);
  const [testingBitbucket, setTestingBitbucket] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); // { success: boolean, message: string }

  const [githubConfig, setGithubConfig] = useState({
    personalAccessToken: '',
    username: '',
    organization: ''
  });
  const [savingGithub, setSavingGithub] = useState(false);
  const [testingGithub, setTestingGithub] = useState(false);
  const [githubConnectionStatus, setGithubConnectionStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  // New Member State
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    department: '',
    designation: ''
  });
  const [registeringMember, setRegisteringMember] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (profile?.role !== 'admin') return;
      setLoadingUsers(true);
      try {
        const res = await authAPI.getOrganizationUsers();
        setUsers(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users');
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();

    if (profile?.role === 'admin') {
      const fetchBitbucket = async () => {
        try {
          const res = await authAPI.getBitbucketConfig();
          if (res.data) setBitbucketConfig({
            workspace: res.data.workspace || '',
            apiToken: res.data.apiToken || ''
          });
        } catch (err) {
          console.warn('Failed to fetch bitbucket config');
        }
      };
      fetchBitbucket();

      const fetchGithub = async () => {
        try {
          const res = await authAPI.getGithubConfig();
          if (res.data) setGithubConfig({
            personalAccessToken: res.data.personalAccessToken || '',
            username: res.data.username || '',
            organization: res.data.organization || ''
          });
        } catch (err) {
          console.warn('Failed to fetch github config');
        }
      };
      fetchGithub();
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.role !== 'admin') return;
    const loadOnline = async () => {
      try {
        const res = await authAPI.getActiveEmployees();
        setOnline(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load live tracker');
      }
    };
    loadOnline();
    const id = setInterval(loadOnline, 20000);
    return () => clearInterval(id);
  }, [profile]);

  const handleGalleryClick = () => {
    document.getElementById('avatar-file-input').click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size too large. Max 2MB.');
        return;
      }
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSave = async () => {
    try {
      const res = await authAPI.updateProfile({
        avatarUrl,
        phoneNumber
      });
      const updatedUser = res.data.user;
      setProfile(updatedUser);
      updateUser(updatedUser);
      setIsEditingPhone(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleBitbucketSave = async (e) => {
    e.preventDefault();
    setSavingBitbucket(true);
    try {
      await authAPI.saveBitbucketConfig(bitbucketConfig);
      alert('Bitbucket configuration saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save Bitbucket config');
    } finally {
      setSavingBitbucket(false);
    }
  };

  const handleBitbucketTest = async () => {
    setTestingBitbucket(true);
    setConnectionStatus(null);
    try {
      const res = await authAPI.testBitbucketConnection(bitbucketConfig);
      setConnectionStatus({ success: true, message: res.data.message });
    } catch (err) {
      setConnectionStatus({
        success: false,
        message: err.response?.data?.message || 'Connection failed. Please check your token and workspace slug.'
      });
    } finally {
      setTestingGithub(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGithubSave = async (e) => {
    e.preventDefault();
    setSavingGithub(true);
    try {
      await authAPI.saveGithubConfig(githubConfig);
      alert('GitHub configuration saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save GitHub config');
    } finally {
      setSavingGithub(false);
    }
  };

  const handleRegisterMember = async (e) => {
    e.preventDefault();
    setRegisteringMember(true);
    try {
      const orgName = profile?.organizationId?.name || '';
      await authAPI.registerEmployee({
        ...newMember,
        organizationName: orgName
      });
      alert('Member registered successfully!');
      setNewMember({ firstName: '', lastName: '', email: '', password: '', department: '', designation: '' });

      // Refresh user list
      const res = await authAPI.getOrganizationUsers();
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register member');
    } finally {
      setRegisteringMember(false);
    }
  };

  const handleGithubTest = async () => {
    setTestingGithub(true);
    setGithubConnectionStatus(null);
    try {
      const res = await authAPI.testGithubConnection(githubConfig);
      setGithubConnectionStatus({ success: true, message: res.data.message });
    } catch (err) {
      setGithubConnectionStatus({
        success: false,
        message: err.response?.data?.message || 'Connection failed. Please check your token and username/org.'
      });
    } finally {
      setTestingGithub(false);
    }
  };

  return (
    <div className="settings-page professional">
      <div className="settings-container">
        <header className="settings-header">
          <div className="header-info">
            <div className="header-badge-settings">
              <SettingsIcon size={14} />
              <span>System Preferences</span>
            </div>
            <h1>Control Center</h1>
            <p>Manage your account, appearance, and organizational visibility</p>
          </div>
          <div className={`role-tag-settings ${profile?.role}`}>
            <Shield size={14} />
            <span>{profile?.role}</span>
          </div>
        </header>

        <div className="settings-grid-professional">
          {/* Appearance Section */}
          <section className="settings-card-minimal">
            <div className="card-inner-header">
              <div className="icon-box"><Moon size={20} /></div>
              <div className="title-box">
                <h3>Visual Interface</h3>
                <p>Toggle system theme</p>
              </div>
            </div>
            <div className="theme-toggle-row">
              <div className="theme-info">
                <span className="current-mode">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                <p>System preference is currently active</p>
              </div>
              <button className="btn-toggle-switch" onClick={toggleTheme}>
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                <span>{isDarkMode ? 'Enable Light' : 'Enable Dark'}</span>
              </button>
            </div>
          </section>

          {/* Account Profile Section */}
          <section className="settings-card-minimal">
            <div className="card-inner-header">
              <div className="icon-box"><User size={20} /></div>
              <div className="title-box">
                <h3>Profile Settings</h3>
                <p>Update identity and avatar</p>
              </div>
            </div>
            <div className="profile-settings-content">
              <div className="avatar-preview-section">
                <div className="avatar-large-settings">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" />
                  ) : (
                    <span>{profile?.firstName?.[0]}{profile?.lastName?.[0] || profile?.username?.[0]}</span>
                  )}
                </div>
                <div className="avatar-input-box">
                  <label>Avatar Resource URL</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                    />
                    <input
                      type="file"
                      id="avatar-file-input"
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <button
                      className="btn-gallery-minimal"
                      onClick={handleGalleryClick}
                      title="Choose from Gallery"
                      type="button"
                    >
                      <Image size={16} />
                    </button>
                    <button className="btn-save-minimal" onClick={handleProfileSave}>
                      <Save size={16} />
                    </button>
                  </div>
                  <span className="hint-text">Paste image URL or choose from gallery</span>
                </div>
              </div>
              <div className="user-details-list">
                <div className="detail-item">
                  <span className="detail-label">Username</span>
                  <span className="detail-value">{profile?.username}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Distribution Email</span>
                  <span className="detail-value">{profile?.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone Number</span>
                  <div className="phone-edit-wrapper">
                    {!isEditingPhone ? (
                      <div className="phone-display-row">
                        <span className="detail-value">{phoneNumber || 'Not provided'}</span>
                        <button className="btn-edit-minimal" onClick={() => setIsEditingPhone(true)} title="Edit Phone Number">
                          <Pencil size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="phone-input-row">
                        <div className="input-with-icon-minimal">
                          <Phone size={14} />
                          <input
                            type="text"
                            className="inline-edit-input"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+91 XXXXX XXXXX"
                            autoFocus
                          />
                        </div>
                        <div className="action-buttons-minimal">
                          <button className="btn-save-circle" onClick={handleProfileSave} title="Save">
                            <Check size={14} />
                          </button>
                          <button className="btn-cancel-circle" onClick={() => { setPhoneNumber(profile?.phoneNumber || ''); setIsEditingPhone(false); }} title="Cancel">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {profile?.role === 'admin' && (
                  <div className="detail-item workspace-id-item">
                    <span className="detail-label">Organization Name</span>
                    <div className="copyable-id">
                      <span className="detail-value mono">
                        {profile?.organizationId?.name || 'Basic Corp'}
                      </span>
                      <button className="copy-btn-minimal" onClick={() => copyToClipboard(profile?.organizationId?.name || 'Basic Corp')}>
                        {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Integration Section */}
          <section className="settings-card-minimal">
            <div className="card-inner-header">
              <div className="icon-box"><GitBranch size={20} /></div>
              <div className="title-box">
                <h3>Bitbucket Integration</h3>
                <p>Automate repository lifecycle</p>
              </div>
            </div>
            {profile?.role === 'admin' ? (
              <form onSubmit={handleBitbucketSave} className="integration-form">
                <div className="form-group-minimal">
                  <label>Bitbucket API Token (Recommended)</label>
                  <div className="input-with-icon">
                    <Lock size={14} />
                    <input
                      type="password"
                      placeholder="Paste your API token here..."
                      value={bitbucketConfig.apiToken}
                      onChange={e => setBitbucketConfig({ ...bitbucketConfig, apiToken: e.target.value })}
                    />
                  </div>
                  <p className="hint-text-sm" style={{ marginTop: '4px' }}>New Bitbucket standard. No username required.</p>
                </div>

                <div className="divider-minimal" style={{ margin: '10px 0', borderTop: '1px solid var(--border-subtle)' }}></div>

                <div className="form-group-minimal">
                  <label>Workspace ID</label>
                  <input
                    type="text"
                    placeholder="Workspace slug"
                    value={bitbucketConfig.workspace}
                    onChange={e => setBitbucketConfig({ ...bitbucketConfig, workspace: e.target.value })}
                  />
                </div>

                {connectionStatus && (
                  <div className={`connection-status-info ${connectionStatus.success ? 'success' : 'error'}`}>
                    {connectionStatus.success ? '✅ ' : '❌ '}
                    {connectionStatus.message}
                  </div>
                )}

                <div className="integration-buttons-row">
                  <button type="submit" className="btn-primary-settings" disabled={savingBitbucket}>
                    {savingBitbucket ? 'Saving...' : 'Save Configuration'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary-settings"
                    onClick={handleBitbucketTest}
                    disabled={testingBitbucket || !bitbucketConfig.workspace || !bitbucketConfig.apiToken}
                  >
                    {testingBitbucket ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="integration-content">
                <div className="integration-item">
                  <div className="integration-info">
                    <span className="integration-name">Bitbucket Workspace</span>
                    <p>Auto-creates cloud repositories</p>
                  </div>
                  <span className="status-badge-locked">Admin Only</span>
                </div>
              </div>
            )}
          </section>

          {/* GitHub Integration Section */}
          <section className="settings-card-minimal">
            <div className="card-inner-header">
              <div className="icon-box"><Github size={20} /></div>
              <div className="title-box">
                <h3>GitHub Integration</h3>
                <p>Automate GitHub repository lifecycle</p>
              </div>
            </div>
            {profile?.role === 'admin' ? (
              <form onSubmit={handleGithubSave} className="integration-form">
                <div className="form-group-minimal">
                  <label>Personal Access Token</label>
                  <div className="input-with-icon">
                    <Lock size={14} />
                    <input
                      type="password"
                      placeholder="ghp_xxxxxxxxxxxx"
                      value={githubConfig.personalAccessToken}
                      onChange={e => setGithubConfig({ ...githubConfig, personalAccessToken: e.target.value })}
                    />
                  </div>
                  <p className="hint-text-sm" style={{ marginTop: '4px' }}>Requires 'repo' scope.</p>
                </div>

                <div className="form-group-minimal">
                  <label>GitHub Username (Optional if using Org)</label>
                  <input
                    type="text"
                    placeholder="Your GitHub username"
                    value={githubConfig.username}
                    onChange={e => setGithubConfig({ ...githubConfig, username: e.target.value })}
                  />
                </div>

                <div className="form-group-minimal">
                  <label>Organization Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="Organization slug"
                    value={githubConfig.organization}
                    onChange={e => setGithubConfig({ ...githubConfig, organization: e.target.value })}
                  />
                </div>

                {githubConnectionStatus && (
                  <div className={`connection-status-info ${githubConnectionStatus.success ? 'success' : 'error'}`}>
                    {githubConnectionStatus.success ? '✅ ' : '❌ '}
                    {githubConnectionStatus.message}
                  </div>
                )}

                <div className="integration-buttons-row">
                  <button type="submit" className="btn-primary-settings" disabled={savingGithub}>
                    {savingGithub ? 'Saving...' : 'Save Configuration'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary-settings"
                    onClick={handleGithubTest}
                    disabled={testingGithub || !githubConfig.personalAccessToken}
                  >
                    {testingGithub ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="integration-content">
                <div className="integration-item">
                  <div className="integration-info">
                    <span className="integration-name">GitHub Account</span>
                    <p>Auto-creates GitHub repositories</p>
                  </div>
                  <span className="status-badge-locked">Admin Only</span>
                </div>
              </div>
            )}
          </section>

          {/* System Info Section */}
          <section className="settings-card-minimal">
            <div className="card-inner-header">
              <div className="icon-box"><Info size={20} /></div>
              <div className="title-box">
                <h3>System Manifest</h3>
                <p>Version and build information</p>
              </div>
            </div>
            <div className="system-info-content">
              <div className="version-info">
                <div className="version-tag">Production v1.2.4</div>
                <p>Build fingerprint: enterprise-pm-2024-q1</p>
              </div>
              <div className="history-list">
                <div className="history-header"><History size={14} /> <span>Release History</span></div>
                <ul>
                  <li>Enhanced Role Management</li>
                  <li>Global Theme Normalization</li>
                  <li>Inquiry Pipeline Implementation</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Admin Directory Section (Conditional) */}
          {profile?.role === 'admin' && (
            <>
              <section className="settings-card-minimal admin-only">
                <div className="card-inner-header">
                  <div className="icon-box"><Users size={20} /></div>
                  <div className="title-box">
                    <h3>Member Directory</h3>
                    <p>Organization access control</p>
                  </div>
                </div>
                <div className="directory-list-minimal">
                  {users.length > 0 ? users.map((u) => (
                    <div key={u._id} className="directory-item">
                      <div className="dir-user-info">
                        <span className="dir-username">{u.username}</span>
                        <span className="dir-email">{u.email}</span>
                      </div>
                      <span className={`badge-minimal ${u.role}`}>{u.role}</span>
                    </div>
                  )) : <p className="empty-notice">No active members found</p>}
                </div>
              </section>

              <section className="settings-card-minimal admin-only">
                <div className="card-inner-header">
                  <div className="icon-box"><UserPlus size={20} /></div>
                  <div className="title-box">
                    <h3>Provision Workspace Account</h3>
                    <p>Onboard new organization members</p>
                  </div>
                </div>
                <form onSubmit={handleRegisterMember} className="integration-form">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="form-group-minimal">
                      <label>First Name</label>
                      <input
                        type="text"
                        placeholder="First Name"
                        value={newMember.firstName}
                        onChange={e => setNewMember({ ...newMember, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group-minimal">
                      <label>Last Name</label>
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={newMember.lastName}
                        onChange={e => setNewMember({ ...newMember, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group-minimal mb-3">
                    <label>Work Email</label>
                    <input
                      type="email"
                      placeholder="name.basics@gmail.com"
                      value={newMember.email}
                      onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group-minimal mb-3">
                    <label>Initial Password</label>
                    <input
                      type="password"
                      placeholder="Set a temporary password"
                      value={newMember.password}
                      onChange={e => setNewMember({ ...newMember, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="form-group-minimal">
                      <label>Department</label>
                      <input
                        type="text"
                        placeholder="e.g. Engineering"
                        value={newMember.department}
                        onChange={e => setNewMember({ ...newMember, department: e.target.value })}
                      />
                    </div>
                    <div className="form-group-minimal">
                      <label>Designation</label>
                      <input
                        type="text"
                        placeholder="e.g. Developer"
                        value={newMember.designation}
                        onChange={e => setNewMember({ ...newMember, designation: e.target.value })}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary-settings w-full" disabled={registeringMember}>
                    {registeringMember ? 'Provisioning...' : 'Complete Onboarding'}
                  </button>
                </form>
              </section>

              <section className="settings-card-minimal admin-only">
                <div className="card-inner-header">
                  <div className="icon-box"><Activity size={20} /></div>
                  <div className="title-box">
                    <h3>Availability Monitor</h3>
                    <p>Live session tracking</p>
                  </div>
                </div>
                <div className="online-monitor-list">
                  {online.length > 0 ? online.map((o) => (
                    <div key={o.sessionId} className="online-item">
                      <div className="status-indicator online"></div>
                      <div className="dir-user-info">
                        <span className="dir-username">{o.user?.username}</span>
                        <span className="dir-email">{o.user?.email}</span>
                      </div>
                    </div>
                  )) : <p className="empty-notice">No active sessions synchronized</p>}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div >
  );
};

export default Settings;
