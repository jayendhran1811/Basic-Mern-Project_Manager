import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tasksAPI, notificationAPI } from '../../utils/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import {
    Clock,
    Calendar,
    User,
    Users,
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    MessageSquare,
    Shield,
    Briefcase,
    Activity
} from 'lucide-react';
import Loading from '../ui/Loading';
import './TaskDetail.css';

const TaskDetail = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comment, setComment] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

    useEffect(() => {
        fetchTaskDetails();
    }, [taskId]);

    const showToast = (message, type = 'info') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
    };

    const fetchTaskDetails = async () => {
        try {
            setLoading(true);
            const response = await tasksAPI.getById(taskId);
            setTask(response.data);
        } catch (err) {
            setError('Tactical Access error: Unable to retrieve deliverable data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            if (task.status === 'completed') {
                showToast('Status Lock Enabled: This deliverable is archived and immutable.', 'error');
                return;
            }

            await tasksAPI.updateStatus(task._id, newStatus);
            showToast(`Task status updated to ${newStatus}`, 'success');

            // Notify Admin if employee is updating
            if (user.role === 'employee') {
                await notificationAPI.create({
                    type: 'task_report',
                    title: `Task ${newStatus}`,
                    message: `Employee ${user.firstName} has updated task "${task.title}" to ${newStatus}.`,
                    taskId: task._id
                });
            }

            fetchTaskDetails();
        } catch (err) {
            showToast(err.response?.data?.message || 'Update Failure: Contact system administrator.', 'error');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;

        try {
            await tasksAPI.addComment(task._id, comment);
            setComment('');
            fetchTaskDetails();
            showToast('Comment committed to session log.', 'success');
        } catch (err) {
            showToast('Comment Failure: Unable to save to ledger.', 'error');
        }
    };

    if (loading) return <Loading text="Decrypting deliverable details..." />;
    if (error) return (
        <div className="error-container">
            <AlertCircle size={48} color="#ef4444" />
            <h2>{error}</h2>
            <button className="btn-secondary" onClick={() => navigate(-1)}>Back to Grid</button>
        </div>
    );
    if (!task) return <div className="not-found">Deliverable not found.</div>;

    const isCompleted = task.status === 'completed';

    return (
        <div className="task-detail-container">
            <header className="detail-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>
                <div className="header-badges">
                    <span className={`status-pill ${task.status.replace(' ', '-')}`}>{task.status}</span>
                    <span className={`priority-badge ${task.priority}`}>{task.priority} Priority</span>
                </div>
            </header>

            <div className="detail-content-grid">
                {/* Left Column: Info */}
                <div className="detail-main">
                    <div className="detail-card">
                        <div className="card-top">
                            <span className="category-tag">{task.category}</span>
                            <h1>{task.title}</h1>
                        </div>
                        <div className="detail-description">
                            <h3>Description</h3>
                            <p>{task.description || 'No detailed objective description provided.'}</p>
                        </div>

                        <div className="assigned-info">
                            <div className="info-block">
                                <label><User size={14} /> Assigned Personnel</label>
                                <div className="personnel-list">
                                    {task.assignedEmployees?.length > 0 ? task.assignedEmployees.map(emp => (
                                        <div key={emp._id} className="person-pill">
                                            {emp.firstName} {emp.lastName}
                                        </div>
                                    )) : (
                                        <div className="empty-state-mini">No direct personnel assigned</div>
                                    )}
                                </div>
                            </div>

                            {task.assignedTeam && (
                                <div className="info-block">
                                    <label><Users size={14} /> Assigned Team</label>
                                    <div className="team-badge">
                                        <Shield size={14} />
                                        <span>{task.assignedTeam.name}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="detail-card mt-6">
                        <div className="card-header">
                            <h2><MessageSquare size={18} /> Objective Session Log</h2>
                        </div>
                        <div className="comments-list">
                            {task.comments?.length > 0 ? task.comments.map((c, i) => (
                                <div key={i} className="comment-item">
                                    <div className="comment-meta">
                                        <span className="author">{c.authorId?.firstName} {c.authorId?.lastName}</span>
                                        <span className="date">{new Date(c.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p className="comment-text">{c.text}</p>
                                </div>
                            )) : (
                                <div className="empty-comments">No entries in the session log.</div>
                            )}
                        </div>
                        <form className="comment-form" onSubmit={handleAddComment}>
                            <textarea
                                placeholder="Enter system update or comment..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                            <button type="submit" className="btn-primary" disabled={!comment.trim()}>Broadcast Update</button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Sidebar */}
                <div className="detail-sidebar">
                    <div className="status-control-card">
                        <h3>Status Management</h3>
                        <p className="hint">Modify current mission status</p>

                        <div className="status-buttons">
                            <button
                                className={`status-opt in-progress ${task.status === 'in-progress' ? 'active' : ''}`}
                                onClick={() => handleStatusUpdate('in-progress')}
                                disabled={isCompleted}
                            >
                                <Activity size={16} />
                                <span>In Progress</span>
                            </button>
                            <button
                                className={`status-opt blocked ${task.status === 'blocked' ? 'active' : ''}`}
                                onClick={() => handleStatusUpdate('blocked')}
                                disabled={isCompleted}
                            >
                                <AlertCircle size={16} />
                                <span>Blocked</span>
                            </button>
                            <button
                                className={`status-opt completed ${isCompleted ? 'active' : ''}`}
                                onClick={() => handleStatusUpdate('completed')}
                                disabled={isCompleted}
                            >
                                <CheckCircle size={16} />
                                <span>Mark Completed</span>
                            </button>
                        </div>

                        {isCompleted && (
                            <div className="lock-notice">
                                <Shield size={16} />
                                <span>Resource Lock: Deliverable Archived</span>
                            </div>
                        )}
                    </div>

                    <div className="meta-card mt-6">
                        <div className="meta-row">
                            <Calendar size={18} />
                            <div className="meta-item-info">
                                <span className="label">Deadline</span>
                                <span className="value">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No limit'}</span>
                            </div>
                        </div>
                        <div className="meta-row">
                            <Clock size={18} />
                            <div className="meta-item-info">
                                <span className="label">Initialized</span>
                                <span className="value">{new Date(task.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className="meta-row">
                            <Briefcase size={18} />
                            <div className="meta-item-info">
                                <span className="label">Project context</span>
                                <span className="value">{task.projectId?.title || 'Standalone Deliverable'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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

export default TaskDetail;
