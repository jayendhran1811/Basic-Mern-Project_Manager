# 📄 Files You Need to Create Manually

## ⚠️ These files are NOT in git and must be created:

### 1. `backend/.env` (REQUIRED)

Create this file in the `backend` folder:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/projectmanagement
JWT_SECRET=your_super_secret_jwt_key_12345
NODE_ENV=development
```

**How to create:**
- Windows: Right-click in `backend` folder → New → Text Document → Rename to `.env`
- Mac/Linux: `touch backend/.env` then edit it

### 2. `frontend/.env` (OPTIONAL)

Only needed if backend runs on different port:

```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## ✅ Files That Are Already Included

All these are already in the project:
- ✅ All React components
- ✅ All backend routes and models
- ✅ All CSS files
- ✅ package.json files
- ✅ README.md

---

## 📦 What Gets Installed Automatically

When you run `npm install`, these folders are created:
- `backend/node_modules/` (backend dependencies)
- `frontend/node_modules/` (frontend dependencies)

**These are NOT in git** - they're created automatically.

---

## 🎯 Summary

**You only need to create ONE file manually:**
- `backend/.env` ← This is the most important!

Everything else will work after running `npm install` in both folders.

