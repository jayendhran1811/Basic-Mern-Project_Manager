import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API calls
export const authAPI = {
  // Create organization and register admin
  createOrganization: (data) =>
    apiClient.post('/auth/create-organization', data),

  // Register employee
  registerEmployee: (data) =>
    apiClient.post('/auth/register-employee', data),

  // Login
  login: (email, password, organizationId) =>
    apiClient.post('/auth/login', { email, password, organizationId }),

  // Logout
  logout: (sessionId) =>
    apiClient.post('/auth/logout', { sessionId }),

  // Password Recovery
  forgotPassword: (data) =>
    apiClient.post('/auth/forgot-password', data),

  resetPassword: (data) =>
    apiClient.post('/auth/reset-password', data),

  // Get current user
  getCurrentUser: () =>
    apiClient.get('/auth/me'),

  // Get all organizations
  getOrganizations: () =>
    apiClient.get('/auth/organizations'),

  // Get organization users
  getOrganizationUsers: () =>
    apiClient.get('/auth/organization-users'),

  // Bitbucket Config
  getBitbucketConfig: () =>
    apiClient.get('/auth/bitbucket-config'),

  saveBitbucketConfig: (data) =>
    apiClient.post('/auth/bitbucket-config', data),

  testBitbucketConnection: (data) =>
    apiClient.post('/auth/test-bitbucket', data),

  // GitHub Config
  getGithubConfig: () =>
    apiClient.get('/auth/github-config'),

  saveGithubConfig: (data) =>
    apiClient.post('/auth/github-config', data),

  testGithubConnection: (data) =>
    apiClient.post('/auth/test-github', data),

  updateUserRole: (userId, designation) =>
    apiClient.patch(`/auth/update-role/${userId}`, { designation }),

  // Global Employee Access
  getAllEmployees: () =>
    apiClient.get('/auth/employees'),

  // Monitoring APIs
  getActiveEmployees: () =>
    apiClient.get('/auth/active-employees'),

  terminateSession: (sessionId) =>
    apiClient.post(`/auth/terminate-session/${sessionId}`),

  cleanupSessions: () =>
    apiClient.post('/auth/cleanup-sessions'),

  // Update profile
  updateProfile: (data) =>
    apiClient.patch('/auth/update-profile', data)
};

// Projects API calls
export const projectsAPI = {
  getAll: () =>
    apiClient.get('/projects'),

  getById: (id) =>
    apiClient.get(`/projects/${id}`),

  create: (data) =>
    apiClient.post('/projects', data),

  update: (id, data) =>
    apiClient.put(`/projects/${id}`, data),

  updateStatus: (id, status) =>
    apiClient.patch(`/projects/${id}/status`, { status }),

  assignEmployees: (id, employeeIds, action = 'add') =>
    apiClient.patch(`/projects/${id}/assign`, { employeeIds, action }),

  getHistory: (id) =>
    apiClient.get(`/projects/${id}/history`),

  getByStatus: (status) =>
    apiClient.get(`/projects/status/${status}`),

  getStatistics: () =>
    apiClient.get('/projects/stats/overview'),

  createBitbucketRepo: (data) =>
    apiClient.post('/projects/create-bitbucket-repo', data),

  createGithubRepo: (data) =>
    apiClient.post('/projects/create-github-repo', data),

  delete: (id) =>
    apiClient.delete(`/projects/${id}`)
};

// Tasks API calls
export const tasksAPI = {
  getAll: (projectId) =>
    apiClient.get('/tasks', { params: { projectId } }),

  getById: (id) =>
    apiClient.get(`/tasks/${id}`),

  create: (data) =>
    apiClient.post('/tasks', data),

  update: (id, data) =>
    apiClient.put(`/tasks/${id}`, data),

  updateStatus: (id, status) =>
    apiClient.patch(`/tasks/${id}/status`, { status }),

  addComment: (id, text) =>
    apiClient.post(`/tasks/${id}/comments`, { text }),

  addTimeSpent: (id, minutes) =>
    apiClient.patch(`/tasks/${id}/time`, { timeSpent: minutes }),

  blockTask: (id, reason) =>
    apiClient.patch(`/tasks/${id}/block`, { isBlocked: true, blockReason: reason }),

  unblockTask: (id) =>
    apiClient.patch(`/tasks/${id}/block`, { isBlocked: false, blockReason: '' }),

  getHistory: (id) =>
    apiClient.get(`/tasks/${id}/history`),

  delete: (id) =>
    apiClient.delete(`/tasks/${id}`)
};

// Attendance API calls
export const attendanceAPI = {
  getPersonalSessions: () =>
    apiClient.get('/attendance/personal'),

  getEmployeeSessions: (employeeId) =>
    apiClient.get(`/attendance/employee/${employeeId}`),

  getActiveSessions: () =>
    apiClient.get('/attendance/organization/active'),

  getDailyReport: (startDate, endDate) =>
    apiClient.get('/attendance/report/daily', { params: { startDate, endDate } }),

  getWorkloadReport: (startDate, endDate) =>
    apiClient.get('/attendance/report/workload', { params: { startDate, endDate } }),

  getLateLoginsReport: (startDate, endDate, startHour = '09') =>
    apiClient.get('/attendance/report/late-logins', { params: { startDate, endDate, startHour } })
};

// Leave API calls
export const leaveAPI = {
  apply: (data) =>
    apiClient.post('/leave/apply', data),

  getMyLeaves: () =>
    apiClient.get('/leave/personal'),

  getPendingLeaves: () =>
    apiClient.get('/leave/organization/pending'),

  approveLeave: (id) =>
    apiClient.post(`/leave/${id}/approve`),

  rejectLeave: (id, reason) =>
    apiClient.post(`/leave/${id}/reject`, { rejectionReason: reason }),

  getLeaveCalendar: (month, year) =>
    apiClient.get('/leave/organization/calendar', { params: { month, year } }),

  getEmployeesOnLeave: () =>
    apiClient.get('/leave/organization/on-leave'),

  cancelLeave: (id) =>
    apiClient.delete(`/leave/${id}`)
};

// Tracker API calls
export const trackerAPI = {
  getPersonalStats: () =>
    apiClient.get('/tracker/personal'),

  getOrganizationStats: () =>
    apiClient.get('/tracker/organization'),

  updateStats: (userId) =>
    apiClient.post(`/tracker/${userId}/update`)
};

// Notification API calls
export const notificationAPI = {
  getAll: () =>
    apiClient.get('/notifications'),

  markAsRead: (id) =>
    apiClient.patch(`/notifications/${id}/read`),

  create: (data) =>
    apiClient.post('/notifications', data)
};

// Reports API calls
export const reportsAPI = {
  getWeeklyReport: (weeks = 4, employeeId = null) =>
    apiClient.get('/reports/weekly', { params: { weeks, employeeId } }),

  getSummary: (employeeId = null) =>
    apiClient.get('/reports/summary', { params: { employeeId } })
};

// Teams API calls
export const teamsAPI = {
  getAll: () =>
    apiClient.get('/teams'),

  create: (data) =>
    apiClient.post('/teams', data),

  update: (id, data) =>
    apiClient.put(`/teams/${id}`, data)
};

export default apiClient;
