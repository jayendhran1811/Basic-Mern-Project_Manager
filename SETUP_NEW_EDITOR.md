# 📝 Setup Guide for New Editor/Environment

## What You Need to Do When Opening in Another Editor

### ✅ Step 1: Copy the Entire Project Folder
- Copy the entire `Basic` folder to your new location/computer
- Make sure all folders (`backend`, `frontend`) are included

### ✅ Step 2: Install Node.js (If Not Installed)
- Download from: https://nodejs.org/
- Install Node.js (v14 or higher)
- Verify: Open terminal and type `node --version`

### ✅ Step 3: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### ✅ Step 4: Create Environment File

Create `backend/.env` file with:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/projectmanagement
JWT_SECRET=your_super_secret_jwt_key_12345
NODE_ENV=development
```

**Important:** The `.env` file is NOT in git (it's in .gitignore), so you need to create it manually!

### ✅ Step 5: Setup MongoDB

**Option A: Local MongoDB**
- Install MongoDB: https://www.mongodb.com/try/download/community
- Start MongoDB service
- Default connection will work with the `.env` above

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string
5. Update `MONGODB_URI` in `backend/.env`

### ✅ Step 6: Run the Project

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

---

## 📋 Checklist for New Editor

- [ ] Node.js installed (`node --version`)
- [ ] MongoDB installed or Atlas account ready
- [ ] All project files copied
- [ ] `backend/.env` file created
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] Backend server running (`npm run dev` in backend folder)
- [ ] Frontend server running (`npm start` in frontend folder)

---

## 🔧 Editor-Specific Setup

### VS Code
- Install extensions: ESLint, Prettier (optional)
- No special config needed

### WebStorm/IntelliJ
- Open the `Basic` folder as project
- Node.js should auto-detect
- No special config needed

### Other Editors
- Just open the `Basic` folder
- Use terminal to run commands

---

## ⚠️ Important Notes

1. **`.env` file is NOT in git** - You MUST create it manually
2. **`node_modules` folder is NOT in git** - Run `npm install` in both folders
3. **MongoDB must be running** - Or use MongoDB Atlas cloud
4. **Two terminals needed** - One for backend, one for frontend

---

## 🚀 Quick Start Commands

```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Create .env file in backend folder
# (Copy content from above)

# 3. Start servers
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm start
```

That's it! 🎉

