# 🎯 Minimal Setup for New Editor

## What You Actually Need to Do:

### 1️⃣ Create `.env` File (REQUIRED)
Create `backend/.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/projectmanagement
JWT_SECRET=your_super_secret_jwt_key_12345
NODE_ENV=development
```

### 2️⃣ Install Dependencies (REQUIRED)
```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3️⃣ Setup MongoDB (REQUIRED)
**Option A: Local MongoDB**
- Install MongoDB
- Start MongoDB service
- Use: `mongodb://localhost:27017/projectmanagement`

**Option B: MongoDB Atlas (Cloud - Easier)**
- Sign up: https://www.mongodb.com/cloud/atlas
- Create cluster
- Get connection string
- Update `MONGODB_URI` in `.env` file

---

## Summary

**3 Things:**
1. ✅ Create `backend/.env` file
2. ✅ Run `npm install` in both folders
3. ✅ Setup MongoDB (local or cloud)

**That's it!** Then run:
- `cd backend && npm run dev`
- `cd frontend && npm start`

