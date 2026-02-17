# 🎯 Project & Workforce Management System - SaaS Platform

**Enterprise-grade, production-ready SaaS solution for IT companies and service-based organizations**

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Build](https://img.shields.io/badge/build-MERN%20Stack-success)

---

## 🌟 Overview

A comprehensive **SaaS-based platform** combining project management, task tracking, employee attendance, and leave management with **enterprise-level security, audit trails, and role-based access control**.

### 🎯 Perfect For
- IT Companies
- Service-Based Organizations
- Software Development Agencies
- Project-Based Businesses
- Large Teams

---

## ✨ Core Features

### 🔐 **Organization & Authentication**
- Company-wide organization accounts
- Role-based access control (Admin/Employee)
- Secure JWT authentication
- Session tracking and history
- User invitation system

### 📁 **Project Management**
- Create, edit, and archive projects
- 5-status workflow (Not Started, Ongoing, On Hold, Delayed, Completed)
- Client information tracking
- Technology stack management
- Development methodology selection
- Multi-employee assignment
- Real-time progress tracking

### ✅ **Task Management**
- Granular task creation and assignment
- 4-status workflow (To Do, In Progress, Blocked, Completed)
- Priority levels (Low, Medium, High)
- Deadline tracking
- Time spent logging
- Comments and updates
- Task blocking with reason tracking
- Automatic completion timestamps

### 🕒 **Attendance & Work Hours**
- Automatic login/logout tracking
- Daily working hours calculation
- Weekly/Monthly summaries
- Admin view of all employees
- Active employee list
- Late login tracking
- Early logout detection

### 🌴 **Leave Management**
- Full-day and half-day leave options
- Leave request workflow
- Admin approval/rejection
- Leave calendar view
- Employee on-leave tracking
- Leave balance management
- Leave history reports

### 📊 **Dashboard & Analytics**
- Admin dashboard with company overview
- Employee workload visualization
- Project status summaries
- Task completion statistics
- Attendance analytics
- Leave reports

### 🔒 **Audit & Compliance**
- **Immutable audit trail** of all changes
- Tracks: project changes, task updates, deadline modifications, assignments
- Non-editable history logs
- User accountability
- Timestamp tracking
- Change detail recording

---

## 🏗️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs
- **Environment**: dotenv

### Frontend
- **Framework**: React.js
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Custom CSS (white/minimal design)
- **Icons**: React Icons

### Database
- **MongoDB** (Local or Atlas Cloud)
- **ODM**: Mongoose v7.5+

---

## 📚 Quick Links

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](QUICK_START.md) | **START HERE** - 5-minute setup guide |
| [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) | Complete API documentation & schema |
| [SETUP_NEW_EDITOR.md](SETUP_NEW_EDITOR.md) | Setup in new environment |

---

## 🚀 Getting Started (30 seconds)

### Prerequisites
- Node.js v14+ ([Download](https://nodejs.org/))
- MongoDB ([Download](https://www.mongodb.com/try/download/community) or use [Atlas Cloud](https://www.mongodb.com/cloud/atlas))

### Installation

**1. Install Backend**
```bash
cd backend
npm install
cp .env.example .env
npm start
```

**2. Install Frontend** (in new terminal)
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

**3. Open Browser**
```
http://localhost:3000
```

**Full Setup Instructions** → See [QUICK_START.md](QUICK_START.md)

---

## 📊 Project Structure

```
Basic/
├── backend/
│   ├── models/
│   │   ├── User.js              # User with org & roles
│   │   ├── Organization.js      # Company accounts
│   │   ├── Project.js           # Projects with metadata
│   │   ├── Task.js              # Tasks with comments
│   │   ├── OnlineSession.js     # Login/logout tracking
│   │   ├── Leave.js             # Leave management
│   │   ├── AuditLog.js          # Immutable change history
│   │   └── Tracker.js           # Analytics & stats
│   ├── routes/
│   │   ├── auth.js              # Authentication & org
│   │   ├── projects.js          # Project CRUD
│   │   ├── tasks.js             # Task management
│   │   ├── attendance.js        # Work hours tracking
│   │   ├── leave.js             # Leave management
│   │   └── tracker.js           # Analytics
│   ├── middleware/
│   │   └── auth.js              # JWT & RBAC
│   ├── server.js                # Express setup
│   └── .env.example             # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/            # Login & Register
│   │   │   ├── Dashboard/       # Admin & Employee
│   │   │   ├── Projects/        # Project management
│   │   │   ├── Tasks/           # Task board
│   │   │   ├── Attendance/      # Work hours
│   │   │   └── Leave/           # Leave management
│   │   ├── pages/               # Page layouts
│   │   ├── utils/
│   │   │   └── api.js           # API client
│   │   └── App.js
│   ├── package.json
│   └── .env.example
│
├── QUICK_START.md               # ⭐ START HERE
├── IMPLEMENTATION_GUIDE.md      # Complete documentation
└── SETUP_NEW_EDITOR.md         # Environment setup
```

---

## 🔑 Key Features Deep Dive

### 1. **Organization Management**
```
✓ Create organizations with admin
✓ Invite employees to organization
✓ Separate data per organization
✓ Industry classification
✓ Multi-employee companies
```

### 2. **Role-Based Access Control**
```
Admin:
  • Full system access
  • Create/manage projects
  • Manage employees
  • Approve/reject leaves
  • View all reports & history

Employee:
  • Access assigned projects
  • Update task status
  • Request leaves
  • View personal work hours
  • Add comments to tasks
```

### 3. **Project Lifecycle**
```
Not Started → Ongoing → On Hold / Delayed → Completed
```
With full history tracking of all changes.

### 4. **Task Workflow**
```
To Do → In Progress → Blocked → Completed
```
With status change audit, time tracking, and comments.

### 5. **Audit Trail**
```
✓ Track project requirement changes
✓ Track task status changes  
✓ Track deadline modifications
✓ Track employee assignments
✓ Immutable history logs
✓ User accountability
```

---

## 📖 API Overview

### Authentication
- `POST /api/auth/create-organization` - Create org & admin
- `POST /api/auth/register-employee` - Register employee
- `POST /api/auth/login` - Login (admin/employee)
- `POST /api/auth/logout` - Logout

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project (admin)
- `PUT /api/projects/:id` - Update project (admin)
- `POST /api/projects/:id/assign-employees` - Assign employees
- `GET /api/projects/:id/history` - View audit trail

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id/status` - Update status
- `POST /api/tasks/:id/comments` - Add comment
- `PATCH /api/tasks/:id/time-spent` - Log time
- `GET /api/tasks/:id/history` - View audit trail

### Attendance
- `GET /api/attendance/personal` - Personal work hours
- `GET /api/attendance/organization/active` - Active employees (admin)
- `GET /api/attendance/organization/daily-summary` - Daily report (admin)

### Leave
- `POST /api/leave/apply` - Apply for leave
- `GET /api/leave/personal` - Personal leaves
- `POST /api/leave/:id/approve` - Approve leave (admin)
- `POST /api/leave/:id/reject` - Reject leave (admin)
- `GET /api/leave/organization/on-leave` - Employees on leave (admin)

**Full API Docs** → See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)

---

## 🎨 UI/UX Design

### Color Scheme (SaaS White Design)
```
Background:      #FFFFFF
Surface/Cards:   #F8FAFC
Primary:         #2563EB (Blue)
Secondary Text:  #0F172A (Dark)
Success:         #22C55E (Green)
Borders:         #E2E8F0 (Light Gray)
```

### Features
- ✅ Minimal, professional design
- ✅ Card + table hybrid layouts
- ✅ Clear status badges
- ✅ Smooth transitions
- ✅ Fully responsive (desktop, tablet, mobile)
- ✅ Accessibility focused

---

## 🔒 Security Features

- ✅ JWT token-based authentication
- ✅ Password hashing with bcryptjs
- ✅ Role-based access control (RBAC)
- ✅ Organization data isolation
- ✅ Immutable audit logs
- ✅ Session tracking
- ✅ Input validation
- ✅ Environment variable protection

---

## 🧪 Testing the System

### Admin Account (First Login)
Create organization with any details - you become the admin.

### Test Flow
1. **Create Organization** → Get admin access
2. **Register Employees** → Add team members
3. **Create Projects** → Assign employees
4. **Create Tasks** → Assign to employees
5. **Employee Login** → View assigned work
6. **Update Task Status** → Track progress
7. **Apply for Leave** → Test workflow
8. **Admin Approval** → Complete cycle

---

## 📊 Database Models

### User
```javascript
{
  username, email, firstName, lastName,
  password (hashed), role (admin/employee),
  organizationId, department, designation,
  isActive, isCurrentlyOnLeave, lastLoginAt
}
```

### Project
```javascript
{
  title, description, clientName,
  status, priority, technologyStack,
  methodology, requirements, projectOwner,
  assignedEmployees, organizationId,
  startDate, endDate, progress
}
```

### Task
```javascript
{
  title, description, status, priority,
  assignedEmployees, projectId, organizationId,
  createdBy, dueDate, completedAt, timeSpent,
  comments, isBlocked, blockReason
}
```

### Leave
```javascript
{
  userId, organizationId, leaveType,
  startDate, endDate, reason, status,
  approvedBy, approvalDate, rejectionReason
}
```

### AuditLog (Immutable)
```javascript
{
  organizationId, userId, entityType, entityId,
  action, changeDetails, description, timestamp
}
```

**Full Schema** → See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)

---

## 🚀 Deployment

### Environment Setup
Create `.env` with:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secure_secret
PORT=5000
NODE_ENV=production
```

### Production Checklist
- [ ] Use production MongoDB (Atlas recommended)
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure CORS for your domain
- [ ] Set up error logging
- [ ] Enable database backups
- [ ] Configure rate limiting

### Deployment Platforms
- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **DigitalOcean**: Node.js app platform
- **AWS**: EC2 + RDS/MongoDB Atlas

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Solution: Ensure MongoDB is running or update MONGODB_URI in .env
```

### CORS Errors
```
Solution: Check backend is running on correct port
```

### Dependencies Issue
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
```bash
# Change in .env or kill process
lsof -ti:5000 | xargs kill -9
```

---

## 📚 Documentation Files

| File | Content |
|------|---------|
| [QUICK_START.md](QUICK_START.md) | 5-minute setup guide |
| [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) | Complete technical docs |
| [SETUP_NEW_EDITOR.md](SETUP_NEW_EDITOR.md) | Environment setup |

---

## 🤝 Support & Contributing

This is a **complete, production-ready system**. For:
- **Issues**: Check troubleshooting section above
- **API Help**: See [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
- **Setup Help**: See [QUICK_START.md](QUICK_START.md)

---

## 📝 License

This project is provided as-is for use in your organization.

---

## 🎉 What's Included

✅ Full backend API (Node.js/Express/MongoDB)
✅ Database models with relationships
✅ Authentication & RBAC
✅ Project management system
✅ Task tracking with audit logs
✅ Attendance & work hours tracking
✅ Leave management system
✅ API client (Axios setup)
✅ Comprehensive documentation
✅ Setup guides
✅ Environment templates

---

## 🔄 Status

| Component | Status |
|-----------|--------|
| Backend API | ✅ Complete |
| Database Models | ✅ Complete |
| Authentication | ✅ Complete |
| Project Management | ✅ Complete |
| Task Management | ✅ Complete |
| Attendance Tracking | ✅ Complete |
| Leave Management | ✅ Complete |
| Audit System | ✅ Complete |
| API Documentation | ✅ Complete |
| Setup Guides | ✅ Complete |

---

## 🚀 Next Steps

1. **Start Backend**: `cd backend && npm start`
2. **Start Frontend**: `cd frontend && npm start`
3. **Create Organization**: Fill signup form
4. **Create Employees**: Invite team members
5. **Create Projects**: Start managing work
6. **Explore Features**: Test all functionality

**Read [QUICK_START.md](QUICK_START.md) for detailed instructions!**

---

**Built with ❤️ for Enterprise Teams**

Version 1.0.0 | Production Ready | January 2026


Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI= mongodb link
JWT_SECRET
NODE_ENV
```

Start MongoDB (if running locally):
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
# or
brew services start mongodb-community
```

Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory (optional, defaults to localhost:5000):

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm start
```

The frontend will run on `http://localhost:5000`

## Usage

1. **Register/Login**: Create a new account or login with existing credentials
2. **Dashboard**: View your project overview and statistics
3. **Projects**: Create and manage your projects
4. **Tasks**: Add tasks to projects and track their progress
5. **Tracker**: View detailed statistics and progress visualizations

## Project Structure

```
Basic/
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/     # Auth middleware
│   ├── server.js        # Express server
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── utils/       # Utility functions
│   │   └── App.js       # Main app component
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/project/:projectId` - Get tasks by project
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Tracker
- `GET /api/tracker` - Get tracker statistics

## Database Models

- **User**: username, email, password
- **Project**: title, description, status, priority, userId
- **Task**: title, description, status, priority, projectId, userId
- **Tracker**: userId, stats (projects, tasks, streak), achievements

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm start  # Runs on http://localhost:5000
```

## Production Build

### Frontend
```bash
cd frontend
npm run build
```

The build folder will contain the production-ready files.

## License

ISC

## Author

Jayendhran1811

---

Happy coding! 🚀
