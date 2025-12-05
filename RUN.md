# 🎯 How to Run - Simple Steps

## ⚡ Quick Run (Copy & Paste)

### 1️⃣ Install Backend Dependencies
```bash
cd backend
npm install
```

### 2️⃣ Install Frontend Dependencies  
```bash
cd frontend
npm install
```

### 3️⃣ Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
Wait for: `✅ MongoDB Connected` and `🚀 Server running on port 5000`

### 4️⃣ Start Frontend (Terminal 2 - NEW TERMINAL)
```bash
cd frontend
npm start
```
Browser will open automatically at http://localhost:3000

---

## 📝 Detailed Steps

### Prerequisites Check
- ✅ Node.js installed? Check: `node --version` (should be v14+)
- ✅ MongoDB installed? Check: `mongod --version`

### If MongoDB is NOT installed:

**Option 1: Install MongoDB locally**
- Windows: Download from https://www.mongodb.com/try/download/community
- Mac: `brew install mongodb-community`
- Linux: `sudo apt-get install mongodb`

**Option 2: Use MongoDB Atlas (FREE Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free
3. Create a cluster
4. Get connection string
5. Update `backend/.env` with your Atlas URI

### Running Commands

**Windows PowerShell/CMD:**
```powershell
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend (open new terminal)
cd frontend
npm install
npm start
```

**Mac/Linux Terminal:**
```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend (open new terminal)
cd frontend
npm install
npm start
```

---

## 🎉 That's It!

Once both servers are running:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

**First Time?**
1. Register a new account
2. Create your first project
3. Add tasks to the project
4. Check the Tracker page for cool stats! 📊

---

## ❌ Common Issues

**"Cannot find module"**
→ Run `npm install` in that folder

**"MongoDB connection error"**
→ Start MongoDB: `mongod` or use MongoDB Atlas

**"Port 5000 already in use"**
→ Change PORT in `backend/.env` to 5001

**"Port 3000 already in use"**
→ React will ask to use another port, press Y

