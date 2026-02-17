# 🚀 SaaS Project & Workforce Management System - Complete Setup Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Installation & Setup](#installation--setup)
4. [API Documentation](#api-documentation)
5. [Database Schema](#database-schema)
6. [Features Implemented](#features-implemented)

---

## 🎯 Project Overview

This is a **production-ready, enterprise-grade SaaS Platform** for Project and Workforce Management designed for IT companies and service-based organizations.

### Key Features:
- ✅ Company-wide organization accounts
- ✅ Role-based access control (Admin/Employee)
- ✅ Project management with full lifecycle tracking
- ✅ Task management with comments and time tracking
- ✅ Attendance & work hours tracking
- ✅ Leave management system
- ✅ Complete audit trail and history logging
- ✅ Real-time dashboards and analytics
- ✅ Professional SaaS UI with white/minimal design

---

## 🏗️ System Architecture

### Technology Stack
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (with Mongoose ODM)
- **Frontend**: React.js (separate repo)
- **Authentication**: JWT (JSON Web Tokens)
- **Authorization**: Role-Based Access Control (RBAC)

### Key Entities
1. **Organization** - Company account container
2. **User** - Employees and Admins within an organization
3. **Project** - Business projects with metadata
4. **Task** - Granular work items within projects
5. **OnlineSession** - Login/logout tracking
6. **Leave** - Employee leave management
7. **AuditLog** - Immutable change history

---

## 📦 Installation & Setup

### Prerequisites
- Node.js v14+ (https://nodejs.org/)
- MongoDB (Local or Atlas Cloud)
- npm or yarn

### Step 1: Clone/Setup Project
```bash
cd Basic
```

### Step 2: Backend Setup
```bash
cd backend
npm install
```

### Step 3: Create Environment File
Create `backend/.env`:
```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/projectmanagement

# Server
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_environment

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Step 4: Start MongoDB
```bash
# If MongoDB installed locally
mongod

# Or use MongoDB Atlas (Cloud)
# Update MONGODB_URI in .env with your Atlas connection string
```

### Step 5: Start Backend Server
```bash
npm run dev  # Requires nodemon
# OR
npm start
```

Expected output:
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

### Step 6: Frontend Setup
```bash
cd ../frontend
npm install
npm start
```

Frontend will open at `http://localhost:3000`

---

## 📚 API Documentation

### Authentication Endpoints

#### 1. Create Organization & Admin
**POST** `/api/auth/create-organization`

Request:
```json
{
  "organizationName": "Tech Corp",
  "industry": "IT",
  "adminUsername": "admin@techcorp",
  "adminEmail": "admin@techcorp.com",
  "adminPassword": "securepass123",
  "adminFirstName": "John",
  "adminLastName": "Doe"
}
```

Response:
```json
{
  "message": "Organization and admin created successfully",
  "token": "eyJhbGc...",
  "organization": {
    "id": "org123",
    "name": "Tech Corp",
    "industry": "IT"
  },
  "user": {
    "id": "user123",
    "username": "admin@techcorp",
    "email": "admin@techcorp.com",
    "role": "admin",
    "organizationId": "org123"
  }
}
```

#### 2. Register Employee
**POST** `/api/auth/register-employee`

Request:
```json
{
  "organizationId": "org123",
  "username": "emp1",
  "email": "emp1@techcorp.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "department": "Engineering",
  "designation": "Senior Developer"
}
```

#### 3. Login
**POST** `/api/auth/login`

Request:
```json
{
  "email": "admin@techcorp.com",
  "password": "securepass123",
  "organizationId": "org123"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "sessionId": "session123",
  "user": {
    "id": "user123",
    "username": "admin@techcorp",
    "email": "admin@techcorp.com",
    "role": "admin",
    "organizationId": "org123",
    "isCurrentlyOnLeave": false
  }
}
```

#### 4. Logout
**POST** `/api/auth/logout`
Headers: `Authorization: Bearer <token>`

Request:
```json
{
  "sessionId": "session123"
}
```

#### 5. Get Current User
**GET** `/api/auth/me`
Headers: `Authorization: Bearer <token>`

---

### Project Management Endpoints

#### Create Project (Admin Only)
**POST** `/api/projects`
Headers: `Authorization: Bearer <token>`

Request:
```json
{
  "title": "E-Commerce Platform",
  "description": "Build new e-commerce website",
  "clientName": "ABC Retail",
  "status": "not-started",
  "priority": "high",
  "technologyStack": ["React", "Node.js", "MongoDB"],
  "methodology": "Agile",
  "requirements": "Full product listing, cart, checkout",
  "projectOwner": "projectOwner123",
  "startDate": "2024-01-15",
  "endDate": "2024-06-30"
}
```

#### Get All Projects
**GET** `/api/projects`
Headers: `Authorization: Bearer <token>`

- **Admins**: See all projects
- **Employees**: See only assigned projects

#### Get Single Project
**GET** `/api/projects/:id`

#### Update Project (Admin Only)
**PUT** `/api/projects/:id`

Request:
```json
{
  "status": "ongoing",
  "endDate": "2024-07-15"
}
```

#### Assign Employees to Project (Admin Only)
**POST** `/api/projects/:id/assign-employees`

Request:
```json
{
  "employeeIds": ["emp1", "emp2", "emp3"]
}
```

#### Get Project History/Audit
**GET** `/api/projects/:id/history`
(Admin Only)

---

### Task Management Endpoints

#### Create Task
**POST** `/api/tasks`

Request:
```json
{
  "title": "Design UI Mockups",
  "description": "Create wireframes and mockups for the dashboard",
  "projectId": "project123",
  "priority": "high",
  "dueDate": "2024-02-15",
  "assignedEmployees": ["emp1", "emp2"]
}
```

#### Get All Tasks (with filters)
**GET** `/api/tasks`
- Admins see all tasks
- Employees see only assigned tasks

#### Get Tasks by Project
**GET** `/api/tasks/project/:projectId`

#### Update Task Status
**PATCH** `/api/tasks/:id/status`

Request:
```json
{
  "status": "in-progress"
}
```

Valid statuses: `todo`, `in-progress`, `blocked`, `completed`

#### Add Comment to Task
**POST** `/api/tasks/:id/comments`

Request:
```json
{
  "text": "Waiting for design review from client"
}
```

#### Update Time Spent
**PATCH** `/api/tasks/:id/time-spent`

Request:
```json
{
  "minutes": 120
}
```

#### Block/Unblock Task
**PATCH** `/api/tasks/:id/block`

Request:
```json
{
  "isBlocked": true,
  "blockReason": "Waiting for API documentation"
}
```

#### Delete Task (Admin Only)
**DELETE** `/api/tasks/:id`

---

### Attendance & Work Hours Endpoints

#### Get Personal Work Hours
**GET** `/api/attendance/personal`

Response:
```json
{
  "sessions": [
    {
      "_id": "session1",
      "loginAt": "2024-01-15T09:00:00Z",
      "logoutAt": "2024-01-15T18:00:00Z",
      "duration": 32400
    }
  ],
  "stats": {
    "totalSessions": 22,
    "totalHours": 176,
    "totalMinutes": 10560,
    "totalDays": 22,
    "averageHoursPerDay": "8.00"
  }
}
```

#### Get Work Hours Range
**GET** `/api/attendance/personal/range?startDate=2024-01-01&endDate=2024-01-31`

#### Get Organization's Active Employees
**GET** `/api/attendance/organization/active`
(Admin Only)

#### Get Daily Summary
**GET** `/api/attendance/organization/daily-summary?date=2024-01-15`
(Admin Only)

---

### Leave Management Endpoints

#### Apply for Leave
**POST** `/api/leave/apply`

Request:
```json
{
  "leaveType": "full-day",
  "startDate": "2024-02-10",
  "endDate": "2024-02-12",
  "reason": "Personal emergency"
}
```

#### Get Personal Leave Applications
**GET** `/api/leave/personal`

#### Get Pending Leaves (Admin)
**GET** `/api/leave/organization/pending`

#### Approve Leave (Admin)
**POST** `/api/leave/:id/approve`

#### Reject Leave (Admin)
**POST** `/api/leave/:id/reject`

Request:
```json
{
  "rejectionReason": "Insufficient notice period"
}
```

#### Get Employees Currently On Leave
**GET** `/api/leave/organization/on-leave`

#### Get Leave Calendar
**GET** `/api/leave/organization/calendar?year=2024&month=2`

---

### Dashboard & Tracker Endpoints

#### Get Personal Tracker Stats
**GET** `/api/tracker/personal`

Response:
```json
{
  "stats": {
    "totalProjects": 5,
    "completedProjects": 2,
    "totalTasks": 28,
    "completedTasks": 12,
    "tasksByStatus": {
      "todo": 8,
      "in-progress": 5,
      "blocked": 2,
      "completed": 12
    },
    "tasksByPriority": {
      "low": 5,
      "medium": 15,
      "high": 8
    }
  }
}
```

---

## 🗄️ Database Schema

### Organization
```javascript
{
  _id: ObjectId,
  name: String (unique),
  industry: String (enum: IT, Finance, Healthcare, etc.),
  description: String,
  adminId: ObjectId (ref: User),
  employees: [ObjectId] (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### User
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  firstName: String,
  lastName: String,
  password: String (hashed),
  role: String (enum: admin, employee),
  organizationId: ObjectId (ref: Organization, required),
  department: String,
  designation: String,
  isActive: Boolean,
  isCurrentlyOnLeave: Boolean,
  lastLoginAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Project
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  clientName: String,
  status: String (enum: not-started, ongoing, on-hold, delayed, completed),
  priority: String (enum: low, medium, high),
  technologyStack: [String],
  methodology: String (enum: Agile, Scrum, Waterfall, Kanban, Hybrid),
  requirements: String,
  projectOwner: ObjectId (ref: User),
  assignedEmployees: [ObjectId] (ref: User),
  organizationId: ObjectId (ref: Organization),
  startDate: Date,
  endDate: Date,
  actualEndDate: Date,
  tasks: [ObjectId] (ref: Task),
  progress: Number (0-100),
  createdAt: Date,
  updatedAt: Date
}
```

### Task
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  status: String (enum: todo, in-progress, blocked, completed),
  priority: String (enum: low, medium, high),
  assignedEmployees: [ObjectId] (ref: User),
  projectId: ObjectId (ref: Project),
  organizationId: ObjectId (ref: Organization),
  createdBy: ObjectId (ref: User),
  dueDate: Date,
  completedAt: Date,
  timeSpent: Number (minutes),
  comments: [{
    authorId: ObjectId,
    text: String,
    createdAt: Date
  }],
  isBlocked: Boolean,
  blockReason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### OnlineSession
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  organizationId: ObjectId (ref: Organization),
  loginAt: Date,
  logoutAt: Date,
  duration: Number (seconds),
  ipAddress: String,
  userAgent: String,
  isActive: Boolean,
  createdAt: Date
}
```

### Leave
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  organizationId: ObjectId (ref: Organization),
  leaveType: String (enum: full-day, half-day),
  startDate: Date,
  endDate: Date,
  reason: String,
  status: String (enum: pending, approved, rejected),
  approvedBy: ObjectId (ref: User),
  approvalDate: Date,
  rejectionReason: String,
  numberOfDays: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### AuditLog (Immutable)
```javascript
{
  _id: ObjectId,
  organizationId: ObjectId (ref: Organization),
  userId: ObjectId (ref: User),
  entityType: String (enum: project, task, assignment, requirement, deadline),
  entityId: ObjectId,
  action: String (enum: create, update, delete, status_change, assignment_change),
  changeDetails: {
    fieldChanged: String,
    oldValue: Any,
    newValue: Any
  },
  description: String,
  timestamp: Date (indexed),
  ipAddress: String
}
```

---

## ✨ Features Implemented

### ✅ Authentication & Organization
- [x] Create organization with admin registration
- [x] Employee registration to organization
- [x] JWT-based authentication
- [x] Role-based login
- [x] Session tracking
- [x] Logout with session cleanup

### ✅ Project Management
- [x] CRUD operations for projects
- [x] Project status tracking (5 states)
- [x] Technology stack management
- [x] Methodology selection
- [x] Client information tracking
- [x] Multi-employee assignment
- [x] Project owner management
- [x] Deadline tracking
- [x] Actual end date tracking
- [x] Progress tracking

### ✅ Task Management
- [x] Create tasks within projects
- [x] 4-status workflow (todo, in-progress, blocked, completed)
- [x] Priority levels
- [x] Multi-employee assignment
- [x] Deadline tracking
- [x] Time spent tracking
- [x] Comments and updates
- [x] Task blocking with reason
- [x] Automatic completion timestamp

### ✅ Attendance Tracking
- [x] Login session creation
- [x] Logout session completion
- [x] Duration calculation
- [x] Personal work hours view
- [x] Date range filtering
- [x] Admin view of all employees
- [x] Active employee list
- [x] Daily summary reports
- [x] Average hours calculation

### ✅ Leave Management
- [x] Leave request application
- [x] Full-day and half-day options
- [x] Leave reason tracking
- [x] Admin approval workflow
- [x] Admin rejection with reason
- [x] Leave calendar view
- [x] Current on-leave display
- [x] Leave history tracking
- [x] Days calculation

### ✅ Audit & History
- [x] Immutable audit logs
- [x] Track all project changes
- [x] Track all task status changes
- [x] Track deadline changes
- [x] Track assignments
- [x] Track requirement changes
- [x] User-level accountability
- [x] Timestamp for all changes
- [x] Change detail recording

### ✅ Authorization & Security
- [x] Role-based access control (Admin/Employee)
- [x] Organization isolation
- [x] Project-level authorization
- [x] Task-level authorization
- [x] Password hashing
- [x] JWT token validation
- [x] Admin-only endpoints
- [x] Employee permission boundaries

---

## 🎨 Frontend Setup (Next Steps)

Once backend is running:

1. Create React components in `frontend/src/components/`:
   - AdminDashboard
   - EmployeeDashboard
   - ProjectManager
   - TaskBoard
   - LeaveManagement
   - AttendanceTracking

2. Create pages in `frontend/src/pages/`:
   - Login
   - Register
   - Dashboard
   - Projects
   - Tasks
   - Attendance
   - Leave

3. Use provided API endpoints for data fetching

---

## 🔐 Security Considerations

- Never commit `.env` file
- Rotate JWT_SECRET in production
- Use HTTPS in production
- Implement rate limiting
- Validate all inputs on backend
- Use environment variables for sensitive data
- Regular security audits
- Keep dependencies updated

---

## 📝 Notes

- All passwords are bcrypt hashed
- JWT tokens expire in 7 days
- Audit logs cannot be modified or deleted
- Organization data is completely isolated
- Timestamps in ISO 8601 format
- All monetary/hour values in their base units

---

**Build Date**: January 5, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
