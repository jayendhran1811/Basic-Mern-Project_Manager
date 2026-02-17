# ⚡ Quick Start Guide - 5 Minutes to Running System

## 🎯 What You'll Have After This Guide
A fully functional SaaS Project Management system with:
- ✅ Admin organization creation
- ✅ Employee registration
- ✅ Project management
- ✅ Task tracking
- ✅ Work hours & leave management
- ✅ Admin dashboards

---

## 📋 Prerequisites Checklist
- [ ] Node.js v14+ installed (`node --version`)
- [ ] MongoDB running locally or Atlas account
- [ ] VS Code or Terminal ready

---

## 🚀 Step-by-Step Setup (5 minutes)

### Terminal 1: Backend Setup

```bash
# Navigate to project
cd Basic
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# ⚠️ If using MongoDB Atlas:
#    Edit .env and update MONGODB_URI with your connection string
#    Example: mongodb+srv://user:pass@cluster.mongodb.net/projectmanagement

# Start server
npm start
```

**Expected Output:**
```
✅ MongoDB Connected
🚀 Server running on port 5000
```

---

### Terminal 2: Frontend Setup

```bash
# In new terminal, navigate to frontend
cd Basic/frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start frontend
npm start
```

**Frontend opens at:** `http://localhost:3000`

---

## 🔐 First Time Setup

### Step 1: Create Organization & Admin Account

When you open `http://localhost:3000`, you'll see a setup page:

**Fill in:**
```
Organization Name: Tech Company (or your company name)
Industry: IT
Admin Name: John Doe
Admin Email: admin@techcompany.com
Admin Password: securepass123
```

**Click:** "Create Organization"

You're now logged in as Admin! ✨

---

### Step 2: Create Test Employees

As Admin, go to **Settings > Add Employee**:

**Employee 1:**
```
Name: Jane Smith
Email: jane@techcompany.com
Password: password123
Department: Engineering
Designation: Senior Developer
```

**Employee 2:**
```
Name: Bob Johnson
Email: bob@techcompany.com
Password: password123
Department: Design
Designation: UI/UX Designer
```

---

### Step 3: Create Test Project

Go to **Projects > New Project**:

```
Title: Website Redesign
Client: ABC Corp
Status: Ongoing
Priority: High
Technology: React, Node.js, MongoDB
Methodology: Agile
Start Date: Today
End Date: 3 months from today
Assign To: Jane Smith, Bob Johnson
```

**Click:** "Create Project"

---

### Step 4: Create Test Tasks

Go to **Project > Add Task**:

**Task 1:**
```
Title: Design Homepage Mockup
Assigned To: Bob Johnson
Priority: High
Due Date: 1 week from today
```

**Task 2:**
```
Title: Build React Components
Assigned To: Jane Smith
Priority: High
Due Date: 2 weeks from today
```

---

## 📱 Test All Features

### As Admin:
1. **Dashboard:**
   - View all projects
   - See all employees
   - Check who's online
   - View who's on leave

2. **Projects:**
   - Create/Edit/Delete projects
   - Assign employees
   - View project history

3. **Tasks:**
   - Create/Manage all tasks
   - Update statuses
   - See task history

4. **Employees:**
   - View work hours
   - Check leave requests
   - Approve/Reject leaves
   - View activity logs

### As Employee (Logout & Login as Jane):
1. Login with: jane@techcompany.com / password123
2. **Dashboard:**
   - See assigned projects
   - View my tasks
   - See upcoming deadlines

3. **Tasks:**
   - Update task status (Todo → In Progress → Completed)
   - Add comments
   - Log time spent

4. **Leave:**
   - Apply for leave
   - View your leave history

5. **Work Hours:**
   - See your daily login/logout
   - View total hours worked

---

## 🧪 API Testing (Optional)

Test backend APIs with **Postman** or **Thunder Client**:

### Create Organization
```
POST http://localhost:5000/api/auth/create-organization
Content-Type: application/json

{
  "organizationName": "Test Company",
  "industry": "IT",
  "adminUsername": "admin",
  "adminEmail": "admin@test.com",
  "adminPassword": "pass123",
  "adminFirstName": "Admin",
  "adminLastName": "User"
}
```

### Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "pass123",
  "organizationId": "ORGANIZATION_ID_HERE"
}
```

Copy the returned `token` and use it in all further requests:
```
Authorization: Bearer <token_here>
```

### Create Project
```
POST http://localhost:5000/api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Test Project",
  "description": "Test project description",
  "clientName": "Test Client",
  "projectOwner": "USER_ID_HERE",
  "status": "not-started",
  "priority": "medium",
  "technologyStack": ["React", "Node"],
  "methodology": "Agile"
}
```

---

## 🆘 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Make sure MongoDB is running: `mongod`
- Or use MongoDB Atlas and update MONGODB_URI in .env

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
- Change PORT in .env to 5001
- Or kill process: `lsof -ti:5000 | xargs kill -9`

### CORS Errors
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution:**
- Make sure backend is running on port 5000
- Check CORS_ORIGIN in backend .env

### Dependencies Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 Next Steps

1. **Explore Features:**
   - Create more projects
   - Assign more tasks
   - Request leaves
   - Check audit logs

2. **Customize:**
   - Update colors in CSS (Search for `#2563EB` for primary color)
   - Add your company logo
   - Customize welcome message

3. **Production Deployment:**
   - Follow deployment guide in IMPLEMENTATION_GUIDE.md
   - Set secure JWT_SECRET
   - Use production MongoDB
   - Enable HTTPS

---

## 📖 Full Documentation

For detailed API documentation, database schema, and advanced features:
👉 See `IMPLEMENTATION_GUIDE.md`

---

## 💡 Common Tasks

### Find Organization ID
After creating organization, it's shown in:
- Admin dashboard
- Browser localStorage (key: `organizationId`)
- Admin settings page

### Reset Everything
```bash
# Delete database and restart
# In MongoDB:
db.organizations.deleteMany({})
db.users.deleteMany({})
db.projects.deleteMany({})
db.tasks.deleteMany({})
db.auditelogs.deleteMany({})
```

### View Database
```bash
# Connect to MongoDB
mongosh

# Show databases
show dbs

# Use projectmanagement
use projectmanagement

# Show collections
show collections

# View projects
db.projects.find().pretty()

# View users
db.users.find().pretty()
```

---

## 🎉 Success!

You now have a production-ready SaaS Project Management System!

**Next Features to Test:**
- ✅ Project history/audit logs
- ✅ Task comments
- ✅ Time tracking
- ✅ Attendance reports
- ✅ Leave calendar

---

**Need Help?**
- Check backend logs: Terminal 1
- Check frontend console: Browser DevTools (F12)
- Check MongoDB connection: `mongosh`
- Re-read IMPLEMENTATION_GUIDE.md for detailed API docs

**Happy Building! 🚀**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/projectmanagement
JWT_SECRET=your_super_secret_jwt_key_12345
NODE_ENV=development
```

## Step 4: Run the Application

### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```
✅ Backend will run on http://localhost:5000

### Terminal 2 - Frontend Server
```bash
cd frontend
npm start
```
✅ Frontend will open at http://localhost:3000

## Step 5: Use the App

1. Open http://localhost:3000 in your browser
2. Register a new account
3. Start creating projects and tasks!
4. Check the Tracker page for LeetCode-style stats

## Troubleshooting

**MongoDB Connection Error?**
- Make sure MongoDB is running: `mongod` (Windows) or `brew services start mongodb-community` (Mac)
- Or use MongoDB Atlas cloud database

**Port Already in Use?**
- Change PORT in `backend/.env` to another number (e.g., 5001)
- Update `REACT_APP_API_URL` in `frontend/.env` if needed

**npm install fails?**
- Make sure you have Node.js installed (v14+)
- Try: `npm cache clean --force` then `npm install` again
