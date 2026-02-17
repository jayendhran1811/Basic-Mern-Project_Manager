import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    MessageSquare,
    Shield,
    Star,
    Mail,
    Search,
    MoreVertical,
    CheckCircle,
    AlertCircle,
    Download,
    RefreshCw,
    X,
    ShieldCheck,
    ShieldAlert,
    Clock,
    UserPlus,
    Activity,
    Settings,
    Check,
    Ban,
    Lock,
    Unlock,
    ActivitySquare,
    Trash2
} from 'lucide-react';
import { authAPI, leaveAPI, attendanceAPI, trackerAPI } from '../../utils/apiClient';
import { Button } from '../ui/button';
import './Admin.css';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'leaves', 'sessions'
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeTasks: 0,
        newMessages: 5,
        pendingLeaves: 0,
        onlineNow: 0
    });

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // Sub-data States
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [activeSessions, setActiveSessions] = useState([]);
    const [orgStats, setOrgStats] = useState(null);

    // Registration Modal State
    const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
    const [newMember, setNewMember] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        department: '',
        designation: ''
    });
    const [isRegistering, setIsRegistering] = useState(false);

    // Interactive States
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, sender: 'TechCorp Solutions', text: 'Interested in enterprise license for 500+ users.', date: '2h ago', starred: true },
        { id: 2, sender: 'Global Systems', text: 'Can we integrate custom SAML auth?', date: '5h ago', starred: false },
        { id: 3, sender: 'Startup Inc', text: 'Billing inquiry regarding Q1 invoice.', date: '1d ago', starred: false },
    ]);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const [usersRes, leavesRes, sessionsRes, trackerRes] = await Promise.all([
                authAPI.getOrganizationUsers().catch(err => { console.error('Users fetch failed:', err); return { data: [] }; }),
                leaveAPI.getPendingLeaves().catch(err => { console.error('Leaves fetch failed:', err); return { data: [] }; }),
                authAPI.getActiveEmployees().catch(err => { console.error('Sessions fetch failed:', err); return { data: [] }; }),
                trackerAPI.getOrganizationStats().catch(err => { console.error('Tracker fetch failed:', err); return { data: null }; })
            ]);

            setUsers(usersRes.data);
            setPendingLeaves(leavesRes.data);
            setActiveSessions(sessionsRes.data);
            setOrgStats(trackerRes.data);

            setStats(prev => ({
                ...prev,
                totalUsers: usersRes.data.length,
                pendingLeaves: leavesRes.data.length,
                onlineNow: sessionsRes.data.length
            }));
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Live polling for sessions
    useEffect(() => {
        let interval;
        if (activeTab === 'sessions') {
            interval = setInterval(async () => {
                try {
                    const sessionsRes = await authAPI.getActiveEmployees();
                    setActiveSessions(sessionsRes.data);
                    setStats(prev => ({ ...prev, onlineNow: sessionsRes.data.length }));
                } catch (err) {
                    console.error('Session poll failed:', err);
                }
            }, 10000); // 10s refresh
        }
        return () => clearInterval(interval);
    }, [activeTab]);

    const handleReadMessage = (id) => {
        setMessages(prev => prev.filter(m => m.id !== id));
        setStats(prev => ({
            ...prev,
            newMessages: Math.max(0, prev.newMessages - 1)
        }));
    };

    const handleToggleStar = (id) => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, starred: !m.starred } : m));
    };

    const handleDesignationChange = async (userId, currentDesignation) => {
        const validDesignations = ['Manager', 'Business Analyst', 'Business Development', 'Team Lead', 'Developer', 'DevOps', 'Tester'];
        const currentIndex = validDesignations.indexOf(currentDesignation);
        const nextIndex = (currentIndex + 1) % validDesignations.length;
        const newDesignation = validDesignations[nextIndex];

        try {
            await authAPI.updateUserRole(userId, newDesignation); // The API now takes designation
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, designation: newDesignation } : u));
            showToast(`User moved to ${newDesignation} role`, 'success');
        } catch (error) {
            showToast('Failed to update designation: ' + (error.response?.data?.message || error.message), 'error');
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleLeaveApproval = async (id, status, reason = '') => {
        try {
            if (status === 'Approved') {
                await leaveAPI.approveLeave(id);
            } else {
                await leaveAPI.rejectLeave(id, reason);
            }
            setPendingLeaves(prev => prev.filter(l => l._id !== id));
            setStats(prev => ({ ...prev, pendingLeaves: prev.pendingLeaves - 1 }));
            showToast(`Leave ${status.toLowerCase()} successfully`, 'success');
        } catch (error) {
            showToast('Error updating leave status', 'error');
        }
    };

    const handleOnboardSubmit = async (e) => {
        e.preventDefault();
        setIsRegistering(true);
        try {
            await authAPI.registerEmployee(newMember);
            showToast('Member onboarded successfully!', 'success');
            setIsOnboardModalOpen(false);
            setNewMember({ firstName: '', lastName: '', email: '', password: '', department: '', designation: '' });
            fetchAdminData();
        } catch (error) {
            showToast(error.response?.data?.message || 'Registration failed', 'error');
        } finally {
            setIsRegistering(false);
        }
    };

    const handleCleanupSessions = async () => {
        if (!window.confirm('This will deactivate all sessions older than 24 hours and remove incomplete data. Proceed?')) return;
        try {
            const res = await authAPI.cleanupSessions();
            showToast(res.data.message, 'success');
            const sessionsRes = await authAPI.getActiveEmployees();
            setActiveSessions(sessionsRes.data);
            setStats(prev => ({ ...prev, onlineNow: sessionsRes.data.length }));
        } catch (error) {
            console.error('Cleanup error:', error);
            showToast('Cleanup failed: Server synchronization error', 'error');
        }
    };

    const handleTerminateSession = async (sessionId) => {
        if (!window.confirm('Terminate this active session?')) return;
        try {
            await authAPI.terminateSession(sessionId);
            setActiveSessions(prev => prev.filter(s => s.sessionId !== sessionId));
            setStats(prev => ({ ...prev, onlineNow: Math.max(0, prev.onlineNow - 1) }));
        } catch (error) {
            alert('Failed to terminate session: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleExport = () => {
        showToast("Generating enterprise report...", "info");
        setIsMenuOpen(false);
    };

    const handleRefresh = () => {
        setLoading(true);
        // Simulate refresh
        setTimeout(() => setLoading(false), 800);
        setIsMenuOpen(false);
    };

    if (loading) return (
        <div className="admin-loading-container">
            <div className="spinner-admin"></div>
            <p>Syncing Enterprise Identity...</p>
        </div>
    );

    return (
        <div className="admin-page">
            <div className="admin-container">
                <header className="admin-header">
                    <div className="header-badge">
                        <Shield size={14} />
                        <span>Root Domain Controller</span>
                    </div>
                    <div className="header-title-row">
                        <h1>System Administration</h1>
                        <button className="btn-onboard" onClick={() => setIsOnboardModalOpen(true)}>
                            <UserPlus size={18} /> Onboard Member
                        </button>
                    </div>
                    <p>Global governance and resource orchestration panel</p>
                </header>

                <div className="admin-tabs">
                    <button className={`tab-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
                        <Activity size={18} /> Overview
                    </button>
                    <button className={`tab-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                        <Users size={18} /> Member Directory
                    </button>
                    <button className={`tab-item ${activeTab === 'leaves' ? 'active' : ''}`} onClick={() => setActiveTab('leaves')}>
                        <Clock size={18} /> Leave Approvals {stats.pendingLeaves > 0 && <span className="tab-badge">{stats.pendingLeaves}</span>}
                    </button>
                    <button className={`tab-item ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}>
                        <ActivitySquare size={18} /> Live Monitor {stats.onlineNow > 0 && <span className="tab-badge green">{stats.onlineNow}</span>}
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <>
                        <div className="admin-stats-grid">
                            <div className="admin-stat-card">
                                <div className="stat-icon-admin purple">
                                    <Users size={24} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.totalUsers}</h3>
                                    <p>Total Members</p>
                                </div>
                            </div>
                            <div className="admin-stat-card">
                                <div className="stat-icon-admin blue">
                                    <Activity size={24} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.onlineNow}</h3>
                                    <p>Active Now</p>
                                </div>
                            </div>
                            <div className="admin-stat-card">
                                <div className="stat-icon-admin orange">
                                    <Clock size={24} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.pendingLeaves}</h3>
                                    <p>Pending Requests</p>
                                </div>
                            </div>
                        </div>

                        <div className="admin-content-section grid-2">
                            <div className="card-professional">
                                <div className="card-header-admin">
                                    <h2><ShieldCheck size={20} /> Identity Status</h2>
                                    <Link to="/settings" className="btn-link-admin">Security Audit</Link>
                                </div>
                                <div className="recent-log-list">
                                    {users.slice(0, 5).map(u => (
                                        <div key={u._id} className="log-item-admin">
                                            <div className="log-avatar">{u.username[0].toUpperCase()}</div>
                                            <div className="log-details">
                                                <span className="log-msg"><strong>{u.username}</strong> accessed system dashboard</span>
                                                <span className="log-time">{u.role} • {u.email}</span>
                                            </div>
                                            <div className={`log-status ${u.isActive !== false ? 'success' : 'danger'}`}></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="card-professional">
                                <div className="card-header-admin">
                                    <h2><Mail size={20} /> Client Inquiries</h2>
                                    <span className="msg-count-minimal">{messages.length} New</span>
                                </div>
                                <div className="messages-list-minimal">
                                    {messages.map(msg => (
                                        <div key={msg.id} className={`admin-msg-item-minimal ${msg.starred ? 'starred' : ''}`}>
                                            <div className="msg-header-minimal">
                                                <span className="msg-sender-minimal">{msg.sender}</span>
                                                <span className="msg-date-minimal">{msg.date}</span>
                                            </div>
                                            <p className="msg-preview-minimal">{msg.text}</p>
                                            <div className="msg-actions-minimal">
                                                <button className="action-link" onClick={() => handleReadMessage(msg.id)}>Dismiss</button>
                                                <button className={`star-btn ${msg.starred ? 'active' : ''}`} onClick={() => handleToggleStar(msg.id)}>
                                                    <Star size={14} fill={msg.starred ? "currentColor" : "none"} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'users' && (
                    <div className="card-professional">
                        <div className="card-header-admin">
                            <h2><Users size={20} /> Directory Orchestration</h2>
                            <div className="card-actions-admin">
                                <input
                                    type="text"
                                    className="admin-search-input-full"
                                    placeholder="Query member by name or role..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button className="btn-icon-admin" onClick={fetchAdminData}>
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                        </div>
                        <table className="admin-table-professional">
                            <thead>
                                <tr>
                                    <th style={{ width: '50px' }}>S.No</th>
                                    <th>Identity</th>
                                    <th>Strategic Role</th>
                                    <th>Operational Status</th>
                                    <th>Orchestration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u, index) => (
                                    <tr key={u._id}>
                                        <td style={{ fontWeight: '700', color: 'var(--text-muted)' }}>
                                            {String(index + 1).padStart(2, '0')}
                                        </td>
                                        <td className="user-cell">
                                            <div className="user-avatar-small">{u.username[0].toUpperCase()}</div>
                                            <div className="user-info-small">
                                                <span className="user-name-small">{u.username}</span>
                                                <div className="user-contact-info">
                                                    <span className="user-email-small">{u.email}</span>
                                                    {u.phoneNumber && <span className="user-phone-small">• {u.phoneNumber}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge-minimal ${u.designation?.toLowerCase().replace(' ', '-')}`}>
                                                {u.designation}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="status-indicator-minimal">
                                                <span className="status-dot online"></span>
                                                <span>Synchronized</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-row-admin">
                                                <button
                                                    className="btn-role-action"
                                                    onClick={() => handleDesignationChange(u._id, u.designation)}
                                                    title="Rotate Designation"
                                                >
                                                    <Settings size={16} />
                                                </button>
                                                <button className="btn-role-action danger" onClick={() => showToast('Access Revocation restricted to System Administrator console.', 'error')}>
                                                    <Ban size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'leaves' && (
                    <div className="card-professional">
                        <div className="card-header-admin">
                            <h2><Clock size={20} /> Leave Request Pipeline</h2>
                            <span className="total-badge">{pendingLeaves.length} Pending</span>
                        </div>
                        <div className="leave-requests-grid">
                            {pendingLeaves.length === 0 ? (
                                <div className="empty-state-admin">
                                    <CheckCircle size={48} />
                                    <p>All pipeline requests cleared</p>
                                </div>
                            ) : pendingLeaves.map(leave => (
                                <div key={leave._id} className="leave-card-admin">
                                    <div className="leave-user-info">
                                        <div className="leave-avatar">{leave.userId?.username?.[0].toUpperCase() || '?'}</div>
                                        <div className="leave-meta">
                                            <span className="leave-username">{leave.userId?.username || 'Unknown User'}</span>
                                            <span className="leave-type badge-outline">{leave.leaveType || 'Full Day'}</span>
                                        </div>
                                    </div>
                                    <div className="leave-duration">
                                        <div className="date-box">
                                            <span className="date-label">FROM</span>
                                            <span className="date-val">{new Date(leave.startDate).toLocaleDateString()}</span>
                                        </div>
                                        <div className="date-box">
                                            <span className="date-label">TO</span>
                                            <span className="date-val">{new Date(leave.endDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <p className="leave-reason">"{leave.reason}"</p>
                                    <div className="leave-actions">
                                        <button className="btn-approve" onClick={() => handleLeaveApproval(leave._id, 'Approved')}>
                                            <Check size={16} /> Authorize
                                        </button>
                                        <button className="btn-reject" onClick={() => {
                                            const reason = prompt('Enter rejection reason:');
                                            if (reason) handleLeaveApproval(leave._id, 'Rejected', reason);
                                        }}>
                                            <Ban size={16} /> Decline
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'sessions' && (
                    <div className="card-professional">
                        <div className="card-header-admin">
                            <div className="card-header-titles">
                                <h2><ActivitySquare size={20} /> Live Telemetry Monitor</h2>
                                <span className="live-status-pulse">LIVE REFRESH</span>
                            </div>
                            <button className="btn-cleanup-sessions" onClick={handleCleanupSessions} title="Clear Sessions > 24h & Incomplete Data">
                                <Trash2 size={16} />
                                <span>Purge Broken</span>
                            </button>
                        </div>
                        <div className="session-grid-admin">
                            {activeSessions.length === 0 ? (
                                <div className="empty-state-admin">
                                    <AlertCircle size={48} />
                                    <p>No active terminal sessions detected</p>
                                </div>
                            ) : activeSessions.map(session => (
                                <div key={session.sessionId} className="session-card-admin">
                                    <div className="session-icon">
                                        <Activity size={20} />
                                    </div>
                                    <div className={`session-details ${!session.user ? 'broken-session' : ''}`}>
                                        <span className="session-user">{session.user?.username || 'System Fragment'}</span>
                                        <span className="session-email">{session.user?.email || 'Incomplete Session Data'}</span>
                                        <div className="session-timing">
                                            <Clock size={12} />
                                            <span>Session started: {session.loginAt ? new Date(session.loginAt).toLocaleTimeString() : 'Unknown'}</span>
                                        </div>
                                    </div>
                                    <div className="session-badge">ACTIVE</div>
                                    <button
                                        className="session-terminate-btn"
                                        onClick={() => handleTerminateSession(session.sessionId)}
                                        title="Terminate Session"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Onboard Modal */}
            {isOnboardModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal-card">
                        <div className="modal-header-admin">
                            <h2>Provision New Identity</h2>
                            <button onClick={() => setIsOnboardModalOpen(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleOnboardSubmit} className="onboard-form-admin">
                            <div className="form-grid-admin">
                                <div className="form-group-admin">
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        value={newMember.firstName}
                                        onChange={e => setNewMember({ ...newMember, firstName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group-admin">
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        value={newMember.lastName}
                                        onChange={e => setNewMember({ ...newMember, lastName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group-admin">
                                <label>Work Email</label>
                                <input
                                    type="email"
                                    placeholder="name@organization.ac.in"
                                    value={newMember.email}
                                    onChange={e => setNewMember({ ...newMember, email: e.target.value })}
                                    required
                                />
                                <p className="input-hint-admin">Determines role automatically by pattern</p>
                            </div>
                            <div className="form-group-admin">
                                <label>Initial Authorization Password</label>
                                <input
                                    type="password"
                                    value={newMember.password}
                                    onChange={e => setNewMember({ ...newMember, password: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-grid-admin">
                                <div className="form-group-admin">
                                    <label>Division/Department</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Engineering"
                                        value={newMember.department}
                                        onChange={e => setNewMember({ ...newMember, department: e.target.value })}
                                    />
                                </div>
                                <div className="form-group-admin">
                                    <label>Designation</label>
                                    <select
                                        value={newMember.designation}
                                        onChange={e => setNewMember({ ...newMember, designation: e.target.value })}
                                        className="admin-select-input"
                                        required
                                    >
                                        <option value="">Select Designation</option>
                                        <option value="Business Analyst">Business Analyst (BA)</option>
                                        <option value="Business Development">Business Development (BD)</option>
                                        <option value="Team Lead">Team Lead (TL)</option>
                                        <option value="Developer">Developer (DEV)</option>
                                        <option value="DevOps">DevOps</option>
                                        <option value="Tester">Tester</option>
                                        <option value="Manager">Manager</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-actions-admin">
                                <Button type="button" variant="outline" onClick={() => setIsOnboardModalOpen(false)}>Abort</Button>
                                <Button type="submit" disabled={isRegistering}>
                                    {isRegistering ? 'Provisioning...' : 'Complete Onboarding'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast.show && (
                <div className={`toast-container-task ${toast.type}`}>
                    <div className="toast-content">
                        {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
