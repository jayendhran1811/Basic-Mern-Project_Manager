# Project Management Platform

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing projects and tasks with a LeetCode-style progress tracker.

## Features

- 🔐 **User Authentication** - Register and login system
- 📁 **Project Management** - Create, edit, and delete projects
- ✅ **Task Management** - Add tasks to projects with status and priority
- 📊 **Progress Tracker** - LeetCode-style dashboard with statistics and visualizations
- 🎯 **Streak Tracking** - Track your daily activity streak
- 📈 **Analytics** - View tasks by status and priority
- 🎨 **Beautiful UI** - Modern, responsive design with custom CSS

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- bcryptjs for password hashing

### Frontend
- React.js
- React Router
- Axios for API calls
- Custom CSS (no Tailwind)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Basic
```

### 2. Backend Setup

```bash
cd backend
npm install
```

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

The frontend will run on `http://localhost:3000`

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
npm start  # Runs on http://localhost:3000
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

