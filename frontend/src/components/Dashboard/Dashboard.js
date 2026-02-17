import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { projectsAPI, trackerAPI, tasksAPI, leaveAPI, authAPI, teamsAPI } from '../../utils/apiClient';
import {
  Folder,
  Rocket,
  CheckCircle,
  FileText,
  BarChart,
  Plus,
  Users,
  PieChart,
  Activity,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckSquare,
  X,
  PlusCircle,
  BarChart2,
  Users2,
  Menu,
  Calendar,
  Briefcase,
  Umbrella,
  Plane,
  RefreshCw,
  AlertCircle,
  AlertSquare,
  ArrowUpRight,
  ShieldCheck,
  ActivitySquare,
  ListTodo
} from 'lucide-react';
import './DashboardModern.css';
import Loading from '../ui/Loading';

const Dashboard = ({ isDarkMode, toggleTheme, sidebarOpen, setSidebarOpen }) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    totalTasks: 0
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectData, setNewProjectData] = useState({ title: '', description: '', repositoryUrl: '', priority: 'Medium' });
  const [repoType, setRepoType] = useState('none'); // 'none', 'bitbucket', 'github'
  const [isRepoCreating, setIsRepoCreating] = useState(false);

  const [allProjects, setAllProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null); // null, 'projects', 'activeTasks', 'completedTasks', 'totalTasks'

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveData, setLeaveData] = useState({
    leaveType: 'Full Day',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [isLeaveSubmitting, setIsLeaveSubmitting] = useState(false);
  const [myLeaves, setMyLeaves] = useState([]);
  const [outToday, setOutToday] = useState([]);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // Admin Specific States
  const [orgUsers, setOrgUsers] = useState([]);
  const [orgTeams, setOrgTeams] = useState([]);
  const [orgStats, setOrgStats] = useState(null);
  const [summaryStats, setSummaryStats] = useState(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData();
    }
  }, [authLoading, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (user.designation === 'Manager') {
        const [projectsRes, tasksRes, usersRes, teamsRes, trackerRes, outTodayRes] = await Promise.all([
          projectsAPI.getAll(),
          tasksAPI.getAll(),
          authAPI.getOrganizationUsers().catch(() => ({ data: [] })),
          teamsAPI.getAll().catch(() => ({ data: [] })),
          trackerAPI.getOrganizationStats().catch(() => ({ data: null })),
          leaveAPI.getEmployeesOnLeave().catch(() => ({ data: [] }))
        ]);

        const projects = projectsRes.data || [];
        const tasks = tasksRes.data || [];
        setAllProjects(projects);
        setAllTasks(tasks);
        setOrgUsers(usersRes.data || []);
        setOrgTeams(teamsRes.data || []);
        setOrgStats(trackerRes.data);
        setOutToday(outTodayRes.data || []);

        setStats({
          totalProjects: projects.length,
          activeTasks: tasks.filter(t => (t.status || '').toLowerCase().trim() !== 'completed' && (t.status || '').toLowerCase().trim() !== 'todo').length,
          completedTasks: tasks.filter(t => (t.status || '').toLowerCase() === 'completed').length,
          pendingTasks: tasks.filter(t => (t.status || '').toLowerCase() === 'todo').length,
          totalTasks: tasks.length,
          totalEmployees: (usersRes.data || []).length,
          totalTeams: (teamsRes.data || []).length
        });
        setRecentTasks(tasks.slice(0, 5));
      } else {
        const [projectsRes, tasksRes, myLeavesRes, personalRes] = await Promise.all([
          projectsAPI.getAll(),
          tasksAPI.getAll(),
          leaveAPI.getMyLeaves().catch(() => ({ data: [] })),
          trackerAPI.getPersonalStats().catch(() => ({ data: null }))
        ]);

        const projects = projectsRes.data || [];
        const tasks = tasksRes.data || [];
        setAllProjects(projects);
        setAllTasks(tasks);
        setMyLeaves(myLeavesRes.data || []);
        setSummaryStats(personalRes.data);

        setStats({
          totalProjects: projects.length,
          activeTasks: tasks.filter(t => (t.status || '').toLowerCase().trim() === 'in-progress' || (t.status || '').toLowerCase().trim() === 'blocked').length,
          completedTasks: tasks.filter(t => (t.status || '').toLowerCase() === 'completed').length,
          totalTasks: tasks.length
        });
        setRecentTasks(tasks.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      if (!user?._id && !user?.id) {
        showToast('User session not found. Please log in again.', 'error');
        return;
      }

      const payload = {
        ...newProjectData,
        projectOwner: user._id || user.id,
        priority: newProjectData.priority.toLowerCase() // Backend enum expects lowercase
      };

      const projectRes = await projectsAPI.create(payload);
      const projectId = projectRes.data.project._id;

      if (repoType !== 'none') {
        setIsRepoCreating(true);
        try {
          if (repoType === 'bitbucket') {
            await projectsAPI.createBitbucketRepo({
              projectId,
              name: newProjectData.title,
              description: newProjectData.description,
              isPrivate: true
            });
            showToast('Project and Bitbucket repository created successfully!', 'success');
          } else if (repoType === 'github') {
            await projectsAPI.createGithubRepo({
              projectId,
              name: newProjectData.title,
              description: newProjectData.description,
              isPrivate: true
            });
            showToast('Project and GitHub repository created successfully!', 'success');
          }
        } catch (repoError) {
          console.error('Repo creation failed:', repoError);
          showToast(`Project created, but ${repoType} repository failed: ` + (repoError.response?.data?.message || repoError.message), 'warning');
        } finally {
          setIsRepoCreating(false);
        }
      } else {
        showToast('Project initialized successfully!', 'success');
      }

      setIsNewProjectModalOpen(false);
      setNewProjectData({ title: '', description: '', repositoryUrl: '', priority: 'Medium' });
      setRepoType('none');
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating project:', error);
      showToast('Failed to initialize project: ' + (error.response?.data?.message || 'Server Error'), 'error');
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    try {
      setIsLeaveSubmitting(true);
      await leaveAPI.apply(leaveData);
      showToast('Leave request submitted successfully!', 'success');
      setIsLeaveModalOpen(false);
      setLeaveData({ leaveType: 'Full Day', startDate: '', endDate: '', reason: '' });
      fetchDashboardData();
    } catch (error) {
      console.error('Error applying for leave:', error);
      showToast('Failed to submit leave request: ' + (error.response?.data?.message || 'Server Error'), 'error');
    } finally {
      setIsLeaveSubmitting(false);
    }
  };

  const handleCancelLeave = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
    try {
      await leaveAPI.cancelLeave(id);
      showToast('Leave request cancelled', 'info');
      fetchDashboardData();
    } catch (error) {
      console.error('Error cancelling leave:', error);
      showToast('Failed to cancel request: ' + (error.response?.data?.message || 'Server Error'), 'error');
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'project':
        setIsNewProjectModalOpen(true);
        break;
      case 'task':
        showToast('Navigating to Task Management...', 'info');
        break;
      case 'team':
        showToast('Opening Team Collaboration panel...', 'info');
        break;
      default:
        break;
    }
  };

  const handleReports = () => {
    navigate('/reports');
  };



  if (authLoading || loading) {
    return (
      <Loading text="Initializing your workspace..." fullScreen={true} />
    );
  }

  const completionRate = stats.totalTasks > 0
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
    : 0;

  // DESIGNATION SPECIFIC RENDERING
  const renderManagerDashboard = () => (
    <>
      <div className="stats-grid admin-stats-grid">
        <div className="stat-card stat-card-gradient-1 clickable-card" onClick={() => setSelectedCategory('projects')}>
          <div className="stat-icon-wrapper"><Folder size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Total Projects</p>
            <h3 className="stat-value">{stats.totalProjects}</h3>
          </div>
          <div className="stat-decoration"></div>
        </div>
        <div className="stat-card stat-card-gradient-2 clickable-card" onClick={() => navigate('/tasks')}>
          <div className="stat-icon-wrapper"><CheckSquare size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">System Tasks</p>
            <h3 className="stat-value">{stats.totalTasks}</h3>
          </div>
          <div className="stat-decoration"></div>
        </div>
        <div className="stat-card stat-card-gradient-3 clickable-card" onClick={() => navigate('/admin')}>
          <div className="stat-icon-wrapper"><Users2 size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Personnel</p>
            <h3 className="stat-value">{stats.totalEmployees}</h3>
          </div>
          <div className="stat-decoration"></div>
        </div>
        <div className="stat-card stat-card-gradient-4 clickable-card" onClick={() => navigate('/tasks')}>
          <div className="stat-icon-wrapper"><ActivitySquare size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Active Teams</p>
            <h3 className="stat-value">{stats.totalTeams}</h3>
          </div>
          <div className="stat-decoration"></div>
        </div>
      </div>

      <div className="content-grid admin-layout">
        <div className="content-left">
          <div className="card performance-card">
            <div className="card-header">
              <h2><PieChart size={20} /> Corporate Throughput</h2>
              <div className="header-badges">
                <span className="badge badge-success">{stats.completedTasks} Done</span>
                <span className="badge badge-warning">{stats.activeTasks} Active</span>
              </div>
            </div>
            <div className="progress-stats">
              <div className="progress-circle">
                <svg viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="90" fill="none" stroke="var(--border)" strokeWidth="12" />
                  <circle cx="100" cy="100" r="90" fill="none" stroke="url(#gradient)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${completionRate * 5.65} 565`} transform="rotate(-90 100 100)" />
                </svg>
                <div className="progress-center">
                  <span className="progress-percentage">{completionRate}%</span>
                  <span className="progress-label">Global Goal</span>
                </div>
              </div>
              <div className="perf-summary-list">
                <div className="perf-item">
                  <span className="p-label">Strategic Output</span>
                  <span className="p-val">Accelerated</span>
                </div>
                <div className="perf-item">
                  <span className="p-label">Operational Capacity</span>
                  <span className="p-val">100% Efficiency</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card mt-6 employee-perf-card">
            <div className="card-header">
              <h2><ListTodo size={20} /> Organizational Ledger</h2>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-perf-table">
                <thead>
                  <tr>
                    <th>Personnel</th>
                    <th>Designation</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orgUsers.map(u => (
                    <tr key={u._id}>
                      <td className="user-cell-admin">
                        <div className="u-avatar">{u.firstName[0]}</div>
                        <div className="u-info">
                          <span className="u-name">{u.firstName} {u.lastName}</span>
                        </div>
                      </td>
                      <td><span className="u-role">{u.designation}</span></td>
                      <td><span className="status-indicator online"></span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="content-right">
          <div className="card actions-card">
            <div className="card-header"><h2><ShieldCheck size={20} /> Manager Console</h2></div>
            <div className="management-actions-grid">
              <button className="m-action-btn" onClick={() => setIsNewProjectModalOpen(true)}><PlusCircle size={20} /><span>New Repository</span></button>
              <button className="m-action-btn" onClick={() => navigate('/admin')}><Users2 size={20} /><span>Personnel Settings</span></button>
            </div>
          </div>
          <div className="card mt-6 activity-log-card">
            <div className="card-header"><h2><Clock size={20} /> Executive Audit</h2></div>
            <div className="activity-list-admin">
              {recentTasks.slice(0, 3).map(task => (
                <div key={task._id} className="activity-item-admin">
                  <div className="activity-icon-admin"><RefreshCw size={14} /></div>
                  <div className="activity-content-admin">
                    <p><strong>{task.createdBy?.firstName}</strong> updated {task.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderSiloDashboard = (type) => (
    <>
      <div className="stats-grid">
        <div className="stat-card stat-card-gradient-1">
          <div className="stat-icon-wrapper"><Folder size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">{type === 'tester' ? 'Identified Bugs' : (type === 'devops' ? 'Infra Deployments' : 'Active Items')}</p>
            <h3 className="stat-value">{stats.totalTasks}</h3>
          </div>
        </div>
        <div className="stat-card stat-card-gradient-2">
          <div className="stat-icon-wrapper"><Rocket size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">My Assignments</p>
            <h3 className="stat-value">{stats.activeTasks}</h3>
          </div>
        </div>
        <div className="stat-card stat-card-gradient-3">
          <div className="stat-icon-wrapper"><CheckCircle size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Resolution Rate</p>
            <h3 className="stat-value">{completionRate}%</h3>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="content-left">
          <div className="card recent-projects-card">
            <div className="card-header">
              <h2><Folder size={20} /> {type === 'bd' ? 'Client Deals' : 'Designated Projects'}</h2>
            </div>
            <div className="projects-grid">
              {allProjects.map(project => (
                <div key={project._id} className="project-card-mini">
                  <div className="project-card-header">
                    <div className="project-icon">{project.title.charAt(0)}</div>
                    <div className="project-info"><h4>{project.title}</h4></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="content-right">
          <div className="card recent-tasks-card">
            <div className="card-header"><h2><CheckSquare size={20} /> {type === 'ba' ? 'Requirements' : 'Action Items'}</h2></div>
            <div className="tasks-list">
              {recentTasks.map(task => (
                <div key={task._id} className="task-item-mini clickable-task" onClick={() => navigate(`/tasks/${task._id}`)}>
                  <div className="task-info"><p className="task-title">{task.title}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderDashboardByDesignation = () => {
    switch (user.designation) {
      case 'Manager': return renderManagerDashboard();
      case 'Business Analyst': return renderSiloDashboard('ba');
      case 'Business Development': return renderSiloDashboard('bd');
      case 'Team Lead': return renderSiloDashboard('tl');
      case 'DevOps': return renderSiloDashboard('devops');
      case 'Tester': return renderSiloDashboard('tester');
      case 'Developer':
      default: return renderEmployeeDashboard();
    }
  };

  const renderEmployeeDashboard = () => (
    <>
      <div className="stats-grid">
        <div className="stat-card stat-card-gradient-1 clickable-card" onClick={() => setSelectedCategory('projects')}>
          <div className="stat-icon-wrapper"><Folder size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">My Projects</p>
            <h3 className="stat-value">{stats.totalProjects}</h3>
          </div>
          <div className="stat-decoration"></div>
        </div>
        <div className="stat-card stat-card-gradient-2 clickable-card" onClick={() => setSelectedCategory('activeTasks')}>
          <div className="stat-icon-wrapper"><Rocket size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">My Active Tasks</p>
            <h3 className="stat-value">{stats.activeTasks}</h3>
          </div>
          <div className="stat-decoration"></div>
        </div>
        <div className="stat-card stat-card-gradient-3 clickable-card" onClick={() => setSelectedCategory('completedTasks')}>
          <div className="stat-icon-wrapper"><CheckCircle size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">My Contributions</p>
            <h3 className="stat-value">{stats.completedTasks}</h3>
          </div>
          <div className="stat-decoration"></div>
        </div>
        <div className="stat-card stat-card-gradient-4 clickable-card" onClick={() => setSelectedCategory('totalTasks')}>
          <div className="stat-icon-wrapper"><FileText size={24} /></div>
          <div className="stat-content">
            <p className="stat-label">Assignment Load</p>
            <h3 className="stat-value">{stats.totalTasks}</h3>
          </div>
          <div className="stat-decoration"></div>
        </div>
      </div>

      <div className="content-grid">
        <div className="content-left">
          <div className="card progress-overview">
            <div className="card-header">
              <h2><PieChart size={20} /> Personal Objectives</h2>
              <button className="btn-icon"><MoreVertical size={18} /></button>
            </div>
            <div className="progress-stats">
              <div className="progress-circle">
                <svg viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="90" fill="none" stroke="var(--border)" strokeWidth="12" />
                  <circle cx="100" cy="100" r="90" fill="none" stroke="url(#gradient)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${completionRate * 5.65} 565`} transform="rotate(-90 100 100)" />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--primary)" />
                      <stop offset="100%" stopColor="var(--primary-dark)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="progress-center">
                  <span className="progress-percentage">{completionRate}%</span>
                  <span className="progress-label">Done</span>
                </div>
              </div>
              <div className="progress-details">
                <div className="progress-item">
                  <div className="progress-item-header">
                    <span className="progress-item-label">Performance Metrics</span>
                    <span className="progress-item-value">{stats.completedTasks} / {stats.totalTasks}</span>
                  </div>
                  <div className="progress-bar-mini">
                    <div className="progress-bar-fill" style={{ width: `${completionRate}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card recent-projects-card mt-6">
            <div className="card-header">
              <h2><Folder size={20} /> Assigned Repositories</h2>
              <a href="/projects" className="btn-link">All Projects <ChevronRight size={14} /></a>
            </div>
            {allProjects.length === 0 ? (
              <div className="empty-state-mini"><Folder size={32} /><p>No active project assignments</p></div>
            ) : (
              <div className="projects-grid">
                {allProjects.slice(0, 4).map(project => (
                  <div key={project._id} className="project-card-mini">
                    <div className="project-card-header">
                      <div className="project-icon">{project.title.charAt(0)}</div>
                      <div className="project-info"><h4>{project.title}</h4></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="content-right">
          <div className="card recent-tasks-card">
            <div className="card-header">
              <h2><CheckSquare size={20} /> Current Deliverables</h2>
              <a href="/tasks" className="btn-link">View All</a>
            </div>
            <div className="tasks-list">
              {recentTasks.length > 0 ? recentTasks.map(task => (
                <div key={task._id} className="task-item-mini clickable-task" onClick={() => navigate(`/tasks/${task._id}`)}>
                  <div className={`status-dot ${(task.status || '').toLowerCase() === 'completed' ? 'status-done' : 'status-pending'}`}></div>
                  <div className="task-info">
                    <p className="task-title">{task.title}</p>
                    <div className="task-meta">
                      <span className="task-deadline">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="empty-state-mini"><CheckSquare size={32} /><p>No pending deliverables</p></div>
              )}
            </div>
          </div>

          <div className="card my-leaves-card mt-6">
            <div className="card-header">
              <h2><Briefcase size={20} /> Leave / WFH Pipeline</h2>
            </div>
            <div className="tasks-list">
              {myLeaves.length > 0 ? myLeaves.map((leave, idx) => (
                <div key={leave._id || idx} className="task-item-mini">
                  <div className={`status-dot status-${leave.status}`}></div>
                  <div className="task-info">
                    <p className="task-title">{leave.leaveType}</p>
                    <div className="task-meta">
                      <span className="task-deadline">
                        {new Date(leave.startDate).toLocaleDateString()} •
                        <span className={`status-text-${leave.status}`} style={{ marginLeft: '4px', textTransform: 'capitalize' }}>{leave.status}</span>
                      </span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="empty-state-mini"><Calendar size={32} /><p>No active requests</p></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className={`dashboard-modern ${isDarkMode ? 'dark' : ''}`}>
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-toggle-mobile">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle Menu"><Menu size={24} /></button>
          </div>
          <div className="header-content">
            <div className="header-text">
              <h1>Welcome back, {user?.firstName || 'User'}</h1>
              <p className="designation-badge">{user?.designation} Workspace</p>
              <p>{user?.designation === 'Manager' ? 'Enterprise-Wide Oversight & Orchestration' : 'Targeted Tactical Assignments & Reporting'}</p>
            </div>
            <div className="header-actions">
              <button className="theme-toggle" onClick={toggleTheme} title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>{isDarkMode ? 'Light' : 'Dark'}</button>
              <button className="theme-toggle" onClick={fetchDashboardData} title="Refresh Workspace"><RefreshCw size={14} className={loading ? 'spinning-icon' : ''} /></button>
              {user?.designation === 'Manager' && (
                <button className="btn-secondary" onClick={handleReports}><BarChart size={18} /><span>Strategic Reports</span></button>
              )}
              {user?.designation === 'Manager' && (
                <button className="btn-primary" onClick={() => setIsNewProjectModalOpen(true)}><Plus size={18} /><span>Provision Project</span></button>
              )}
              {user?.designation !== 'Manager' && (
                <button className="btn-primary" onClick={() => setIsLeaveModalOpen(true)}><Plus size={18} /><span>Apply Leave</span></button>
              )}
            </div>
          </div>
        </div>

        {renderDashboardByDesignation()}
      </div>

      {/* New Project Modal Overlay */}
      {isNewProjectModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-professional card max-w-[500px]">
            <div className="modal-header">
              <h2>Initialize New Repository</h2>
              <button className="btn-icon" onClick={() => setIsNewProjectModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateProject} className="modal-form">
              <div className="form-group">
                <label>Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infrastructure API"
                  value={newProjectData.title}
                  onChange={e => setNewProjectData({ ...newProjectData, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Repository URL (Bitbucket/Github)</label>
                <input
                  type="url"
                  placeholder="https://bitbucket.org/workspace/repo"
                  value={newProjectData.repositoryUrl}
                  onChange={e => setNewProjectData({ ...newProjectData, repositoryUrl: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="System architecture overview..."
                  value={newProjectData.description}
                  onChange={e => setNewProjectData({ ...newProjectData, description: e.target.value })}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Priority Tier</label>
                <select
                  value={newProjectData.priority}
                  onChange={e => setNewProjectData({ ...newProjectData, priority: e.target.value })}
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Standard Priority</option>
                  <option value="High">Critical Priority</option>
                </select>
              </div>
              <div className="form-group">
                <label>Repository Automation</label>
                <select
                  value={repoType}
                  onChange={e => setRepoType(e.target.value)}
                >
                  <option value="none">Create Locally Only</option>
                  <option value="bitbucket">Bitbucket Cloud (Auto-create)</option>
                  <option value="github">GitHub Cloud (Auto-create)</option>
                </select>
                <p className="hint-text-sm" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Choose a cloud platform to automatically initialize a private repository.
                </p>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsNewProjectModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isRepoCreating}>
                  {isRepoCreating ? 'Creating Repo...' : 'Initialize Repository'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Application Modal */}
      {isLeaveModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-professional card max-w-[500px]">
            <div className="modal-header">
              <h2>Request Leave / WFH</h2>
              <button className="btn-icon" onClick={() => setIsLeaveModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleApplyLeave} className="modal-form">
              <div className="form-group">
                <label>Type of Request</label>
                <select
                  required
                  value={leaveData.leaveType}
                  onChange={e => setLeaveData({ ...leaveData, leaveType: e.target.value })}
                >
                  <option value="Full Day">Full Day Leave</option>
                  <option value="Half Day">Half Day Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Paid Leave">Paid Leave</option>
                  <option value="Work From Home">Work From Home (WFH)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveData.startDate}
                    onChange={e => setLeaveData({ ...leaveData, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveData.endDate}
                    onChange={e => setLeaveData({ ...leaveData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reason / Request Details</label>
                <textarea
                  required
                  placeholder="Explain the reason for leave or WFH request..."
                  value={leaveData.reason}
                  onChange={e => setLeaveData({ ...leaveData, reason: e.target.value })}
                  rows={4}
                ></textarea>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsLeaveModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isLeaveSubmitting}>
                  {isLeaveSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drill-down Details Modal */}
      {selectedCategory && (
        <div className="modal-overlay" onClick={() => setSelectedCategory(null)}>
          <div className="modal-content-professional stat-details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="header-info">
                <h2 style={{ textTransform: 'capitalize' }}>
                  {selectedCategory === 'projects' ? 'Total Projects' : selectedCategory.replace(/([A-Z])/g, ' $1')}
                </h2>
                <p>Detailed view of system entities</p>
              </div>
              <button className="btn-icon" onClick={() => setSelectedCategory(null)}><X size={20} /></button>
            </div>

            <div className="details-list-container">
              {selectedCategory === 'projects' ? (
                <div className="details-grid">
                  {allProjects.map(proj => (
                    <div key={proj._id} className="detail-item-card">
                      <div className="item-icon-circle"><Folder size={18} /></div>
                      <div className="item-info">
                        <span className="item-title">{proj.title}</span>
                        <span className="item-subtitle">{proj.description || 'No project description'}</span>
                      </div>
                      <div className={`status-pill ${proj.status || 'ongoing'}`}>{proj.status || 'Active'}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="details-grid">
                  {allTasks
                    .filter(task => {
                      if (selectedCategory === 'activeTasks') return (task.status || '').toLowerCase() !== 'completed';
                      if (selectedCategory === 'completedTasks') return (task.status || '').toLowerCase() === 'completed';
                      return true; // totalTasks
                    })
                    .map(task => (
                      <div key={task._id} className="detail-item-card">
                        <div className="item-icon-circle"><CheckSquare size={18} /></div>
                        <div className="item-info">
                          <span className="item-title">{task.title}</span>
                          <span className="item-subtitle">
                            Belongs to: <strong>{task.projectId?.title || 'General Tasks'}</strong>
                          </span>
                        </div>
                        <div className={`status-pill ${task.status || 'todo'}`}>{task.status}</div>
                      </div>
                    ))
                  }
                </div>
              )}
              {((selectedCategory === 'projects' ? allProjects : allTasks).length === 0) && (
                <div className="empty-details">
                  <Activity size={48} />
                  <p>No records found in this category.</p>
                </div>
              )}
            </div>
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

export default Dashboard;
