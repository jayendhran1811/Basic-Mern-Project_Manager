# ✅ Quick Checklist - Opening in New Editor

## 📋 What You MUST Do:

### 1. Copy Project Folder
- [ ] Copy entire `Basic` folder to new location

### 2. Install Node.js
- [ ] Download from https://nodejs.org/ (if not installed)
- [ ] Verify: `node --version` in terminal

### 3. Create `.env` File
- [ ] Go to `backend` folder
- [ ] Create new file named `.env`
- [ ] Add this content:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/projectmanagement
JWT_SECRET=your_super_secret_jwt_key_12345
NODE_ENV=development
```

### 4. Install Dependencies
- [ ] Open terminal in `backend` folder → `npm install`
- [ ] Open terminal in `frontend` folder → `npm install`

### 5. Setup MongoDB
- [ ] Option A: Install MongoDB locally
- [ ] Option B: Use MongoDB Atlas (cloud) - update `.env` with connection string

### 6. Run Project
- [ ] Terminal 1: `cd backend && npm run dev`
- [ ] Terminal 2: `cd frontend && npm start`
- [ ] Open http://localhost:3000

---

## 🎯 That's It!

**Only 1 file to create manually:** `backend/.env`

Everything else is already in the project! 🚀

