import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { notificationAPI } from '../../utils/apiClient';

const NotificationCenter = ({ isDarkMode }) => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await notificationAPI.getAll();
            setNotifications(response.data);
        } catch (error) {
            console.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'read' } : n));
        } catch (error) {
            console.error('Failed to mark notification as read');
        }
    };

    const unreadCount = notifications.filter(n => n.status === 'unread').length;

    return (
        <div className="notification-center-wrapper" ref={dropdownRef}>
            <button
                className={`notification-trigger ${unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                title="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className={`notification-dropdown ${isDarkMode ? 'dark' : ''}`}>
                    <div className="dropdown-header">
                        <h3>Notifications</h3>
                        <button className="close-btn" onClick={() => setIsOpen(false)}><X size={16} /></button>
                    </div>

                    <div className="notification-list">
                        {loading && notifications.length === 0 ? (
                            <div className="notif-feedback">Syncing...</div>
                        ) : notifications.length === 0 ? (
                            <div className="notif-empty">
                                <AlertCircle size={32} />
                                <p>Operational channels clear.</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif._id}
                                    className={`notification-item ${notif.status === 'unread' ? 'unread' : ''}`}
                                    onClick={() => markAsRead(notif._id)}
                                >
                                    <div className="notif-icon-box">
                                        {notif.type === 'task_report' ? <Check className="text-emerald-500" size={16} /> : <AlertCircle className="text-primary" size={16} />}
                                    </div>
                                    <div className="notif-content">
                                        <div className="notif-title-row">
                                            <span className="notif-title">{notif.title}</span>
                                            <span className="notif-time">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="notif-msg">{notif.message}</p>
                                    </div>
                                    {notif.status === 'unread' && <div className="unread-dot"></div>}
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="dropdown-footer">
                            <button className="btn-clear-all" onClick={() => alert('Clear all functionality coming soon in System V2.')}>
                                <Trash2 size={12} /> Clear History
                            </button>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .notification-center-wrapper {
                    position: relative;
                }
                .notification-trigger {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    padding: 8px;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    position: relative;
                }
                .notification-trigger:hover {
                    background: var(--surface-hover);
                    color: var(--primary);
                }
                .unread-badge {
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    background: var(--danger);
                    color: white;
                    font-size: 9px;
                    font-weight: 800;
                    min-width: 14px;
                    height: 14px;
                    border-radius: 7px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 3px;
                    border: 2px solid var(--surface);
                }
                .notification-dropdown {
                    position: absolute;
                    bottom: 0;
                    left: calc(100% + 12px);
                    width: 320px;
                    background: var(--surface);
                    border: 1px solid var(--border-main);
                    border-radius: 16px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                    z-index: 1001;
                    animation: slideIn 0.2s ease-out;
                    display: flex;
                    flex-direction: column;
                    max-height: 500px;
                }
                @keyframes slideIn {
                    from { transform: translateX(-10px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .dropdown-header {
                    padding: 16px;
                    border-bottom: 1px solid var(--border-subtle);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .dropdown-header h3 {
                    font-size: 14px;
                    font-weight: 800;
                    margin: 0;
                }
                .notification-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px;
                }
                .notification-item {
                    display: flex;
                    gap: 12px;
                    padding: 12px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: background 0.2s;
                    position: relative;
                }
                .notification-item:hover {
                    background: var(--surface-hover);
                }
                .notification-item.unread {
                    background: var(--primary-subtle);
                }
                .notif-icon-box {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: var(--surface);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    box-shadow: var(--shadow-sm);
                }
                .notif-content {
                    flex: 1;
                    min-width: 0;
                }
                .notif-title-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2px;
                }
                .notif-title {
                    font-size: 13px;
                    font-weight: 800;
                }
                .notif-time {
                    font-size: 10px;
                    color: var(--text-muted);
                }
                .notif-msg {
                    font-size: 12px;
                    color: var(--text-muted);
                    margin: 0;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .unread-dot {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    width: 6px;
                    height: 6px;
                    background: var(--primary);
                    border-radius: 50%;
                }
                .notif-empty {
                    padding: 40px 20px;
                    text-align: center;
                    color: var(--text-muted);
                }
                .notif-empty p {
                    font-size: 13px;
                    margin-top: 12px;
                }
                .dropdown-footer {
                    padding: 12px;
                    border-top: 1px solid var(--border-subtle);
                    text-align: center;
                }
                .btn-clear-all {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    margin: 0 auto;
                }
                .btn-clear-all:hover {
                    color: var(--danger);
                }
            `}</style>
        </div>
    );
};

export default NotificationCenter;
