# 🚀 Quick Start Guide

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 2: Setup MongoDB

**Option A: Local MongoDB**
- Make sure MongoDB is installed and running
- Default connection: `mongodb://localhost:27017/projectmanagement`

**Option B: MongoDB Atlas (Cloud)**
- Create free account at https://www.mongodb.com/cloud/atlas
- Get your connection string
- Update `.env` file with your Atlas URI

## Step 3: Create Environment File

Create `backend/.env` file:
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
