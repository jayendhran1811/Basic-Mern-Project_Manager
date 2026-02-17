import axios from 'axios';
import { getAuthToken, removeAuthToken, removeUser } from './auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeAuthToken();
      removeUser();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== Authentication ====================

export const createOrganization = (data) =>
  api.post('/auth/create-organization', data);

export const registerEmployee = (data) =>
  api.post('/auth/register-employee', data);

export const login = (email, password, organizationId) =>
  api.post('/auth/login', { email, password, organizationId });

export const logout = (sessionId) =>
  api.post('/auth/logout', { sessionId });

export const getCurrentUser = () =>
  api.get('/auth/me');

export const getOrganizations = () =>
  api.get('/auth/organizations');

export const getOrganizationUsers = () =>
  api.get('/auth/organization-users');

export const getActiveEmployees = () =>
  api.get('/auth/active-employees');

// ==================== Projects ====================

export const createProject = (data) =>
  api.post('/projects', data);

export const getAllProjects = () =>
  api.get('/projects');

export const getProject = (projectId) =>
  api.get(`/projects/${projectId}`);

export const updateProject = (projectId, data) =>
  api.put(`/projects/${projectId}`, data);

export const assignEmployeesToProject = (projectId, employeeIds) =>
  api.post(`/projects/${projectId}/assign-employees`, { employeeIds });

export const deleteProject = (projectId) =>
  api.delete(`/projects/${projectId}`);

export const getProjectHistory = (projectId) =>
  api.get(`/projects/${projectId}/history`);

// ==================== Tasks ====================

export const createTask = (data) =>
  api.post('/tasks', data);

export const getAllTasks = () =>
  api.get('/tasks');

export const getTasksByProject = (projectId) =>
  api.get(`/tasks/project/${projectId}`);

export const getTask = (taskId) =>
  api.get(`/tasks/${taskId}`);

export const updateTaskStatus = (taskId, status) =>
  api.patch(`/tasks/${taskId}/status`, { status });

export const updateTask = (taskId, data) =>
  api.put(`/tasks/${taskId}`, data);

export const addComment = (taskId, text) =>
  api.post(`/tasks/${taskId}/comments`, { text });

export const updateTimeSpent = (taskId, minutes) =>
  api.patch(`/tasks/${taskId}/time-spent`, { minutes });

export const blockTask = (taskId, isBlocked, blockReason = '') =>
  api.patch(`/tasks/${taskId}/block`, { isBlocked, blockReason });

export const deleteTask = (taskId) =>
  api.delete(`/tasks/${taskId}`);

export const getTaskHistory = (taskId) =>
  api.get(`/tasks/${taskId}/history`);

// ==================== Attendance ====================

export const getPersonalWorkHours = () =>
  api.get('/attendance/personal');

export const getWorkHoursRange = (startDate, endDate) =>
  api.get('/attendance/personal/range', { params: { startDate, endDate } });

export const getOrganizationWorkHours = () =>
  api.get('/attendance/organization/all');

export const getEmployeeWorkHours = (userId) =>
  api.get(`/attendance/employee/${userId}`);

export const getActiveEmployeesAttendance = () =>
  api.get('/attendance/organization/active');

export const getDailySummary = (date) =>
  api.get('/attendance/organization/daily-summary', { params: { date } });

// ==================== Leave ====================

export const applyForLeave = (data) =>
  api.post('/leave/apply', data);

export const getPersonalLeaves = () =>
  api.get('/leave/personal');

export const getPersonalLeavesByStatus = (status) =>
  api.get(`/leave/personal/${status}`);

export const getOrganizationLeaves = () =>
  api.get('/leave/organization/all');

export const getPendingLeaves = () =>
  api.get('/leave/organization/pending');

export const approveLeave = (leaveId) =>
  api.post(`/leave/${leaveId}/approve`);

export const rejectLeave = (leaveId, rejectionReason) =>
  api.post(`/leave/${leaveId}/reject`, { rejectionReason });

export const getEmployeesOnLeave = () =>
  api.get('/leave/organization/on-leave');

export const getEmployeeLeaveHistory = (userId) =>
  api.get(`/leave/employee/${userId}`);

export const getLeaveCalendar = (year, month) =>
  api.get('/leave/organization/calendar', { params: { year, month } });

export const cancelLeave = (leaveId) =>
  api.delete(`/leave/${leaveId}`);

// ==================== Tracker ====================

export const getPersonalTracker = () =>
  api.get('/tracker/personal');

export const getUserTracker = (userId) =>
  api.get(`/tracker/user/${userId}`);

export default api;

