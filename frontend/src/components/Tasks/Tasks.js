import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    CheckSquare,
    Calendar,
    Search,
    Plus,
    Clock,
    AlertCircle,
    Edit2,
    Check,
    MoreVertical,
    Filter,
    X,
    Loader2,
    Settings,
    Activity,
    Layers,
    Cpu,
    Terminal,
    CheckCircle
} from 'lucide-react';
import { tasksAPI, notificationAPI, teamsAPI } from '../../utils/apiClient';
import { Button } from '../ui/button';
import apiClient from '../../utils/apiClient';
import './Tasks.css';

const Tasks = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [employees, setEmployees] = useState([]);
    const [teams, setTeams] = useState([]);
    const [assignmentType, setAssignmentType] = useState('employee'); // 'employee' or 'team'

    // UI States
    const [isInitializing, setIsInitializing] = useState(false);
    const [initStage, setInitStage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
    };

    // Form State
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        category: 'Project',
        dueDate: new Date().toISOString().split('T')[0],
        assignedEmployees: [],
        assignedTeam: '',
        projectId: ''
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTaskData, setEditingTaskData] = useState(null);

    useEffect(() => {
        fetchTasks();
        const canAssign = ['Manager', 'Team Lead'].includes(user.designation);
        if (canAssign) {
            fetchAssignmentResources();
        }
    }, [user.designation]);

    const fetchAssignmentResources = async () => {
        try {
            const { authAPI, projectsAPI, teamsAPI } = await import('../../utils/apiClient');
            const [empRes, teamsRes, projectsRes] = await Promise.all([
                authAPI.getAllEmployees(),
                teamsAPI.getAll(),
                projectsAPI.getAll()
            ]);

            let filteredEmployees = empRes.data || [];

            // TLs can only assign to Developers, Testers, and DevOps
            if (user.designation === 'Team Lead') {
                filteredEmployees = filteredEmployees.filter(emp =>
                    ['Developer', 'Tester', 'DevOps'].includes(emp.designation)
                );
            }

            setEmployees(filteredEmployees);
            setTeams(teamsRes.data || []);
            setAllProjects(projectsRes.data || []);
        } catch (error) {
            console.error('Error fetching assignment resources:', error);
        }
    };

    const [allProjects, setAllProjects] = useState([]);

    const fetchTasks = async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            const response = await tasksAPI.getAll();
            // If empty, use some high-quality mock data for the first impression
            if (response.data.length === 0) {
                setTasks([
                    { id: 'mock-1', title: 'Infrastructure Optimization', status: 'In Progress', priority: 'High', dueDate: '2024-03-15', category: 'DevOps' },
                    { id: 'mock-2', title: 'Security Audit - Q1', status: 'Completed', priority: 'Medium', dueDate: '2024-03-10', category: 'Security' },
                    { id: 'mock-3', title: 'API Documentation Update', status: 'Todo', priority: 'High', dueDate: '2024-03-20', category: 'Documentation' },
                ]);
            } else {
                setTasks(response.data);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            // Fallback for demo
            setTasks([
                { id: 'mock-1', title: 'Infrastructure Optimization', status: 'In Progress', priority: 'High', dueDate: '2024-03-15', category: 'DevOps' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (id) => {
        try {
            if (id.toString().startsWith('mock')) {
                setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
                showToast('Task marked as completed.', 'success');
                return;
            }
            await tasksAPI.updateStatus(id, 'completed');
            fetchTasks();
            showToast('Task marked as completed.', 'success');
        } catch (error) {
            console.error('Failed to update task');
            showToast('Update Failure: Unable to synchronize with the command center.', 'error');
        }
    };

    const handleReport = async (id, status) => {
        try {
            if (id.toString().startsWith('mock')) {
                setTasks(prev => prev.map(t => t.id === id ? { ...t, status: status } : t));
                showToast(`Reported: ${status}`, 'success');
                return;
            }

            await tasksAPI.updateStatus(id, status);
            fetchTasks();

            // Send notification to admin
            const task = tasks.find(t => t._id === id);
            await notificationAPI.create({
                type: 'task_report',
                title: `Task ${status}`,
                message: `Employee ${user.firstName || user.username} has reported task "${task?.title}" as ${status}.`,
                taskId: id
            });

            showToast(`Tactical Report: Task status set to ${status}. Admin notified.`, 'success');
        } catch (error) {
            console.error('Failed to report status');
            showToast('Reporting Failure: Unable to synchronize with the command center.', 'error');
        }
    };

    const handleEdit = (task) => {
        setEditingTaskData({
            ...task,
            dueDate: new Date(task.dueDate).toISOString().split('T')[0]
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const taskId = editingTaskData._id || editingTaskData.id;
            if (taskId.toString().startsWith('mock')) {
                setTasks(prev => prev.map(t => (t.id === taskId) ? { ...editingTaskData } : t));
            } else {
                await tasksAPI.update(taskId, editingTaskData);
                await fetchTasks();
            }
            setIsEditModalOpen(false);
            showToast('Deliverable updated and synchronized.', 'success');
        } catch (error) {
            console.error('Update error:', error);
            showToast('Update Failure: Unable to commit changes.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleNewTask = () => {
        // Implementation of the "Initialization Environment" Transition requested in the image
        setIsInitializing(true);
        setInitStage('Bootstrapping Task Environment...');

        setTimeout(() => setInitStage('Initializing Resource Allocators...'), 600);
        setTimeout(() => setInitStage('Finalizing Task State Engine...'), 1200);

        setTimeout(() => {
            setIsInitializing(false);
            setShowModal(true);
        }, 1800);
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Data normalization
            const payload = {
                ...newTask,
                priority: newTask.priority.toLowerCase(),
                // If we're on a generic tasks page, projectId might be optional now due to backend fix
            };

            const response = await tasksAPI.create(payload);

            setShowModal(false);
            setNewTask({
                title: '',
                description: '',
                priority: 'Medium',
                category: 'Project',
                dueDate: new Date().toISOString().split('T')[0]
            });

            // Success feedback
            await fetchTasks();
            showToast('New deliverable initialized and synchronized.', 'success');
        } catch (error) {
            console.error('Task creation error:', error.response?.data || error);
            showToast(`Initialization Failure: ${error.response?.data?.message || 'The system was unable to commit the new task state.'}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredTasks = tasks.filter(t =>
        (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.priority || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="tasks-loading">Syncing active tasks...</div>;

    return (
        <div className="tasks-page professional">
            <div className="tasks-container">
                <header className="tasks-header-professional">
                    <div className="header-left">
                        <h1>Task Management</h1>
                        <p>Coordinate and track system-wide deliverables</p>
                    </div>
                    <button className="btn-primary-professional" onClick={handleNewTask}>
                        <Plus size={18} />
                        <span>New Task</span>
                    </button>
                </header>

                <div className="tasks-controls-professional">
                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by title, category or priority..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && <X size={14} className="clear-search" onClick={() => setSearchTerm('')} />}
                    </div>
                    <div className="filter-actions">
                        <button className="btn-filter" onClick={() => fetchTasks(true)}>
                            <Clock size={18} />
                            <span>Sync</span>
                        </button>
                        <button className="btn-icon-minimal" onClick={() => alert("More task operations...")}><MoreVertical size={18} /></button>
                    </div>
                </div>

                <div className="tasks-grid-professional">
                    {filteredTasks.length === 0 ? (
                        <div className="no-tasks-found">
                            <Layers size={48} />
                            <p>No deliverables matching your search criteria.</p>
                        </div>
                    ) : (
                        filteredTasks.map((task, index) => (
                            <div
                                key={task._id || task.id || `task-${index}`}
                                className="task-card-professional clickable-card"
                                onClick={(e) => {
                                    // Don't navigate if clicking on status buttons
                                    if (e.target.closest('.report-actions-pill') || e.target.closest('.action-btn-minimal')) return;
                                    navigate(`/tasks/${task._id || task.id}`);
                                }}
                            >
                                <div className="task-card-top">
                                    <span className={`category-tag`}>{task.category || 'General'}</span>
                                    <div className="priority-container">
                                        <span className={`priority-indicator ${(task.priority || 'Medium').toLowerCase()}`}></span>
                                        <span className="priority-text">{task.priority || 'Medium'}</span>
                                    </div>
                                </div>

                                <h3 className="task-title-professional">{task.title}</h3>

                                <div className="task-meta-professional">
                                    <div className="meta-item">
                                        <Clock size={14} />
                                        <span>{task.status}</span>
                                    </div>
                                    <div className="meta-item">
                                        <Calendar size={14} />
                                        <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="task-card-bottom">
                                    <div className="task-progress-minimal">
                                        <div className={`status-pill ${(task.status || 'Todo').toLowerCase().replace(' ', '-')}`}>
                                            {task.status}
                                        </div>
                                    </div>
                                    <div className="task-actions-minimal">
                                        {(user.designation === 'Manager' || user.designation === 'Team Lead') && (
                                            <button className="action-btn-minimal" title="Edit" onClick={() => handleEdit(task)}><Edit2 size={16} /></button>
                                        )}

                                        {user.designation !== 'Manager' && user.designation !== 'Team Lead' ? (
                                            <div className="report-actions-pill">
                                                <button
                                                    className={`report-btn ${task.status === 'in-progress' ? 'active' : ''}`}
                                                    onClick={() => handleReport(task._id || task.id, 'in-progress')}
                                                >
                                                    In Progress
                                                </button>
                                                <button
                                                    className={`report-btn success ${task.status === 'completed' ? 'active' : ''}`}
                                                    onClick={() => handleReport(task._id || task.id, 'completed')}
                                                >
                                                    Completed
                                                </button>
                                            </div>
                                        ) : (
                                            // Manager/TL view: Can mark complete directly or manage tasks
                                            <button
                                                className={`action-btn-minimal success ${task.status === 'completed' || task.status === 'Completed' ? 'disabled' : ''}`}
                                                title="Complete"
                                                onClick={() => handleComplete(task._id || task.id)}
                                                disabled={task.status === 'completed' || task.status === 'Completed'}
                                            >
                                                <Check size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Initialization Overlay - The requested interaction from the image */}
            {isInitializing && (
                <div className="init-overlay">
                    <div className="init-message-box">
                        <div className="init-icon-row">
                            <Cpu className="spin-slow" size={32} />
                            <Terminal className="blink" size={32} />
                        </div>
                        <h3>System Alert</h3>
                        <p>{initStage}</p>
                        <div className="init-loader-bar">
                            <div className="loader-progress"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* New Task Modal */}
            {showModal && (
                <div className="task-modal-overlay">
                    <div className="task-modal-card">
                        <div className="modal-header">
                            <div>
                                <h2>Initialize New deliverable</h2>
                                <p>Set tactical objectives and deadlines</p>
                            </div>
                            <button className="close-btn" onClick={() => setShowModal(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="task-form">
                            <div className="form-group">
                                <label>Deliverable Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Database Migration Q2"
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Strategic Priority</label>
                                    <select
                                        value={newTask.priority}
                                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                    >
                                        <option value="High">High Priority</option>
                                        <option value="Medium">Medium Priority</option>
                                        <option value="Low">Low Priority</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Deadline</label>
                                    <input
                                        type="date"
                                        value={newTask.dueDate}
                                        onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Assignment Strategy</label>
                                <div className="assignment-toggle">
                                    <button
                                        type="button"
                                        className={assignmentType === 'employee' ? 'active' : ''}
                                        onClick={() => setAssignmentType('employee')}
                                    >
                                        Personnel
                                    </button>
                                    <button
                                        type="button"
                                        className={assignmentType === 'team' ? 'active' : ''}
                                        onClick={() => setAssignmentType('team')}
                                    >
                                        Team
                                    </button>
                                </div>
                            </div>

                            {assignmentType === 'employee' ? (
                                <div className="form-group">
                                    <label>Select Personnel</label>
                                    <select
                                        value={newTask.assignedEmployees[0] || ''}
                                        onChange={(e) => setNewTask({ ...newTask, assignedEmployees: [e.target.value], assignedTeam: '' })}
                                        required={assignmentType === 'employee'}
                                    >
                                        <option value="">Choose Personnel...</option>
                                        {employees.map(emp => (
                                            <option key={emp._id} value={emp._id}>
                                                {emp.firstName} {emp.lastName} [{emp.designation}]
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>Select Team</label>
                                    <select
                                        value={newTask.assignedTeam}
                                        onChange={(e) => setNewTask({ ...newTask, assignedTeam: e.target.value, assignedEmployees: [] })}
                                        required={assignmentType === 'team'}
                                    >
                                        <option value="">Choose Team...</option>
                                        {teams.map(team => (
                                            <option key={team._id} value={team._id}>{team.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Project Alignment</label>
                                <select
                                    value={newTask.projectId}
                                    onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                                    required
                                >
                                    <option value="">Select Target Project...</option>
                                    {allProjects.map(proj => (
                                        <option key={proj._id} value={proj._id}>{proj.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Category</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Infrastructure, Security..."
                                    value={newTask.category}
                                    onChange={e => setNewTask({ ...newTask, category: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Project Brief / Description</label>
                                <textarea
                                    placeholder="Describe the technical requirements and outcomes..."
                                    value={newTask.description}
                                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                    rows={4}
                                />
                            </div>
                            <div className="modal-actions">
                                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? <Loader2 className="animate-spin" /> : 'Create Deliverable'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Edit Task Modal */}
            {isEditModalOpen && editingTaskData && (
                <div className="task-modal-overlay">
                    <div className="task-modal-card">
                        <div className="modal-header">
                            <div>
                                <h2>Update deliverable</h2>
                                <p>Modify objective parameters</p>
                            </div>
                            <button className="close-btn" onClick={() => setIsEditModalOpen(false)}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleUpdateSubmit} className="task-form">
                            <div className="form-group">
                                <label>Deliverable Title</label>
                                <input
                                    type="text"
                                    value={editingTaskData.title}
                                    onChange={e => setEditingTaskData({ ...editingTaskData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Strategic Priority</label>
                                    <select
                                        value={editingTaskData.priority}
                                        onChange={e => setEditingTaskData({ ...editingTaskData, priority: e.target.value })}
                                    >
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Deadline</label>
                                    <input
                                        type="date"
                                        value={editingTaskData.dueDate}
                                        onChange={e => setEditingTaskData({ ...editingTaskData, dueDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    value={editingTaskData.status}
                                    onChange={e => setEditingTaskData({ ...editingTaskData, status: e.target.value })}
                                >
                                    <option value="Todo">Todo</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Project Brief / Description</label>
                                <textarea
                                    value={editingTaskData.description || ''}
                                    onChange={e => setEditingTaskData({ ...editingTaskData, description: e.target.value })}
                                    rows={4}
                                />
                            </div>
                            <div className="modal-actions">
                                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? <Loader2 className="animate-spin" /> : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast.show && (
                <div className={`toast-container-task ${toast.type}`}>
                    <div className="toast-content">
                        {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
