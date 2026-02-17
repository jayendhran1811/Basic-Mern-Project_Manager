# MongoDB Fix for Duplicate Key Error

## Problem
You're getting: "E11000 duplicate key error" when logging in because there's already a session record for your user.

## Solution 1: Clear Sessions Collection (Quick Fix)

Open MongoDB Compass or MongoDB Shell and run:

```javascript
// Connect to your database
use projectmanager

// Clear all sessions
db.onlinesessions.deleteMany({})

// Or delete just your user's session
db.onlinesessions.deleteOne({ userId: ObjectId('695c8d6838ccab592bda6913') })
```

## Solution 2: Fix the Backend Code

The issue is in your backend session handling. You need to update the session instead of creating a new one if it already exists.

### Update your backend login route:

In `backend/routes/auth.js` (or wherever your login route is), change the session creation to use `findOneAndUpdate` with `upsert`:

```javascript
// Instead of creating a new session:
// const session = new OnlineSession({ userId: user._id, ... });
// await session.save();

// Use this (upsert = update if exists, create if not):
await OnlineSession.findOneAndUpdate(
  { userId: user._id },
  {
    userId: user._id,
    sessionToken: token,
    loginTime: new Date(),
    lastActivity: new Date(),
    isActive: true
  },
  { upsert: true, new: true }
);
```

## Solution 3: Remove the Unique Index (Not Recommended)

If you want multiple sessions per user, remove the unique index:

```javascript
db.onlinesessions.dropIndex("userId_1")
```

## Recommended Approach

1. **Clear sessions** (Solution 1) - Quick fix for now
2. **Update backend code** (Solution 2) - Permanent fix

## Commands to Run

### Using MongoDB Shell:
```bash
# Connect to MongoDB
mongosh

# Switch to your database
use projectmanager

# Clear all sessions
db.onlinesessions.deleteMany({})

# Exit
exit
```

### Using MongoDB Compass:
1. Open MongoDB Compass
2. Connect to your database
3. Go to `projectmanager` database
4. Click on `onlinesessions` collection
5. Click "Delete" and confirm to delete all documents

## After Fixing

1. Restart your backend server
2. Try logging in again
3. It should work now!

---

**Note:** This error happens because your backend is trying to create a new session record every time you log in, but there's a unique index on `userId` that prevents duplicate entries. The fix ensures we update the existing session instead of creating a new one.
