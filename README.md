# 🎯 Project & Workforce Management System

A comprehensive MERN-based platform for project management, task tracking, employee attendance, and leave management with role-based access control.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v14+
- MongoDB (Local or Atlas)

### Installation

**1. Clone the repository**
```bash
git clone <your-repo-url>
cd Basic
```

**2. Setup Backend**
```bash
cd backend
npm install
# Create a .env file with MONGODB_URI, JWT_SECRET, and PORT
npm start
```

**3. Setup Frontend**
```bash
cd ../frontend
npm install
# Create a .env file with REACT_APP_API_URL
npm start
```

---

## ✨ Core Features
- **Organization Management**: Create organizations and invite employees.
- **Project Tracking**: Manage projects with custom workflows and progress tracking.
- **Task Management**: Assign tasks, track status (To Do, In Progress, Completed), and log time.
- **Attendance & Leaves**: Automatic login/logout tracking and leave request system.
- **Role-Based Access**: Specialized dashboards for Admins and Employees.

---

## 🏗️ Tech Stack
- **Frontend**: React.js, React Router, Axios, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcryptjs

---

## 📊 Project Structure
```
Basic/
├── backend/
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth & RBAC
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI parts
│   │   ├── pages/       # Application views
│   │   └── utils/       # API services
│   └── package.json
└── README.md
```

---

## 📝 License
This project is licensed under the ISC License.
Jayendhran1811
