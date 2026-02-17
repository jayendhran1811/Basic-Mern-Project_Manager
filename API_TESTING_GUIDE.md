# 🧪 API Testing Guide & Examples

This guide provides curl commands and example requests/responses for all API endpoints.

## 📝 Prerequisites

- Backend running on `http://localhost:5000`
- MongoDB connected
- Postman or curl installed

---

## 🔐 Authentication Endpoints

### 1. Create Organization

```bash
curl -X POST http://localhost:5000/api/auth/create-organization \
  -H "Content-Type: application/json" \
  -d '{
    "organizationName": "TechCorp Inc",
    "industry": "IT",
    "adminUsername": "john.admin",
    "adminEmail": "john@techcorp.com",
    "adminPassword": "Secure@123",
    "adminFirstName": "John",
    "adminLastName": "Doe"
  }'
```

**Response (201):**
```json
{
  "message": "Organization and admin created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "organization": {
    "id": "507f1f77bcf86cd799439011",
    "name": "TechCorp Inc",
    "industry": "IT"
  },
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "username": "john.admin",
    "email": "john@techcorp.com",
    "role": "admin",
    "organizationId": "507f1f77bcf86cd799439011"
  }
}
```

---

### 2. Register Employee

```bash
curl -X POST http://localhost:5000/api/auth/register-employee \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "507f1f77bcf86cd799439011",
    "username": "jane.dev",
    "email": "jane@techcorp.com",
    "password": "Secure@123",
    "firstName": "Jane",
    "lastName": "Smith",
    "department": "Development",
    "designation": "Senior Developer"
  }'
```

**Response (201):**
```json
{
  "message": "Employee registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439013",
    "username": "jane.dev",
    "email": "jane@techcorp.com",
    "role": "employee",
    "firstName": "Jane",
    "lastName": "Smith",
    "organizationId": "507f1f77bcf86cd799439011"
  }
}
```

---

### 3. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@techcorp.com",
    "password": "Secure@123",
    "organizationId": "507f1f77bcf86cd799439011"
  }'
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionId": "507f1f77bcf86cd799439014",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "username": "john.admin",
    "email": "john@techcorp.com",
    "role": "admin",
    "firstName": "John",
    "lastName": "Doe",
    "organizationId": "507f1f77bcf86cd799439011",
    "isCurrentlyOnLeave": false
  }
}
```

---

### 4. Get Current User

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📊 Project Endpoints

### 1. Create Project (Admin Only)

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Mobile App Development",
    "description": "Build iOS and Android app",
    "clientName": "StartupXYZ",
    "status": "ongoing",
    "priority": "high",
    "technologyStack": ["React Native", "Node.js", "MongoDB"],
    "methodology": "Agile",
    "requirements": "App with 5 main features",
    "projectOwner": "507f1f77bcf86cd799439012",
    "assignedEmployees": ["507f1f77bcf86cd799439013"],
    "startDate": "2025-01-15",
    "endDate": "2025-06-30"
  }'
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439020",
  "title": "Mobile App Development",
  "description": "Build iOS and Android app",
  "clientName": "StartupXYZ",
  "status": "ongoing",
  "priority": "high",
  "technologyStack": ["React Native", "Node.js", "MongoDB"],
  "methodology": "Agile",
  "projectOwner": {
    "_id": "507f1f77bcf86cd799439012",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@techcorp.com"
  },
  "assignedEmployees": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@techcorp.com"
    }
  ],
  "progress": 0,
  "createdAt": "2025-01-15T10:30:00Z"
}
```

---

### 2. Get All Projects

```bash
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer <token>"
```

---

### 3. Update Project Status (Admin Only)

```bash
curl -X PATCH http://localhost:5000/api/projects/507f1f77bcf86cd799439020/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "status": "completed"
  }'
```

---

### 4. Assign Employees to Project (Admin Only)

```bash
curl -X PATCH http://localhost:5000/api/projects/507f1f77bcf86cd799439020/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "employeeIds": ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"],
    "action": "add"
  }'
```

---

### 5. Get Project History

```bash
curl -X GET http://localhost:5000/api/projects/507f1f77bcf86cd799439020/history \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439030",
    "entityType": "project",
    "action": "create",
    "description": "Created project: Mobile App Development",
    "timestamp": "2025-01-15T10:30:00Z",
    "userId": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@techcorp.com"
    }
  },
  {
    "_id": "507f1f77bcf86cd799439031",
    "entityType": "project",
    "action": "status_change",
    "description": "Status changed from ongoing to completed",
    "changeDetails": {
      "fieldChanged": "status",
      "oldValue": "ongoing",
      "newValue": "completed"
    },
    "timestamp": "2025-01-20T14:45:00Z",
    "userId": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@techcorp.com"
    }
  }
]
```

---

## ✅ Task Endpoints

### 1. Create Task

```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Design UI Mockups",
    "description": "Create mockups for 5 main screens",
    "projectId": "507f1f77bcf86cd799439020",
    "priority": "high",
    "assignedEmployees": ["507f1f77bcf86cd799439013"],
    "dueDate": "2025-01-30"
  }'
```

---

### 2. Update Task Status

```bash
curl -X PATCH http://localhost:5000/api/tasks/507f1f77bcf86cd799439040/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "status": "in-progress"
  }'
```

---

### 3. Add Comment to Task

```bash
curl -X POST http://localhost:5000/api/tasks/507f1f77bcf86cd799439040/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "text": "Started working on the UI mockups. Initial designs look good!"
  }'
```

---

### 4. Log Time Spent

```bash
curl -X PATCH http://localhost:5000/api/tasks/507f1f77bcf86cd799439040/time \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "timeSpent": 120
  }'
```

---

### 5. Block Task

```bash
curl -X PATCH http://localhost:5000/api/tasks/507f1f77bcf86cd799439040/block \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "isBlocked": true,
    "blockReason": "Waiting for design assets from client"
  }'
```

---

## 🌴 Leave Endpoints

### 1. Apply for Leave

```bash
curl -X POST http://localhost:5000/api/leave/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "leaveType": "full-day",
    "startDate": "2025-02-15",
    "endDate": "2025-02-17",
    "reason": "Personal emergency"
  }'
```

---

### 2. Get My Leave Requests

```bash
curl -X GET http://localhost:5000/api/leave/my-leaves \
  -H "Authorization: Bearer <token>"
```

---

### 3. Get Pending Requests (Admin Only)

```bash
curl -X GET http://localhost:5000/api/leave/pending \
  -H "Authorization: Bearer <token>"
```

---

### 4. Approve Leave (Admin Only)

```bash
curl -X PATCH http://localhost:5000/api/leave/507f1f77bcf86cd799439050/approve \
  -H "Authorization: Bearer <token>"
```

---

### 5. Reject Leave (Admin Only)

```bash
curl -X PATCH http://localhost:5000/api/leave/507f1f77bcf86cd799439050/reject \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "rejectionReason": "Critical project deadline"
  }'
```

---

## 🕒 Attendance Endpoints

### 1. Get Personal Sessions

```bash
curl -X GET http://localhost:5000/api/attendance/my-sessions \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439060",
    "loginAt": "2025-01-15T09:00:00Z",
    "logoutAt": "2025-01-15T17:30:00Z",
    "duration": 30600,
    "isActive": false,
    "durationHours": "8.50"
  }
]
```

---

### 2. Get Daily Workload Report (Admin Only)

```bash
curl -X GET "http://localhost:5000/api/attendance/report/daily?startDate=2025-01-01&endDate=2025-01-31" \
  -H "Authorization: Bearer <token>"
```

---

### 3. Get Currently Active Employees (Admin Only)

```bash
curl -X GET http://localhost:5000/api/attendance/active/all \
  -H "Authorization: Bearer <token>"
```

---

## 📈 Testing Workflow

### Complete User Journey

1. **Create Organization**
   ```bash
   # Creates org and admin user
   POST /auth/create-organization
   ```

2. **Admin Logs In**
   ```bash
   # Get JWT token
   POST /auth/login
   # Response: token, sessionId
   ```

3. **Register Employee**
   ```bash
   # Add team member
   POST /auth/register-employee
   ```

4. **Create Project**
   ```bash
   # Admin creates project
   POST /projects
   ```

5. **Assign to Project**
   ```bash
   # Assign employees
   PATCH /projects/:id/assign
   ```

6. **Create Task**
   ```bash
   # Add task to project
   POST /tasks
   ```

7. **Employee Updates Task**
   ```bash
   # Change status
   PATCH /tasks/:id/status
   # Add comment
   POST /tasks/:id/comments
   # Log time
   PATCH /tasks/:id/time
   ```

8. **Apply for Leave**
   ```bash
   # Request time off
   POST /leave/apply
   ```

9. **Admin Approves Leave**
   ```bash
   # Review and approve
   PATCH /leave/:id/approve
   ```

10. **View Reports**
    ```bash
    # Check analytics
    GET /projects/stats/overview
    GET /attendance/report/workload
    ```

---

## 🔍 Debugging Tips

### Enable Detailed Logs

Add to server.js:
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

### Test Error Cases

**Missing Token:**
```bash
curl -X GET http://localhost:5000/api/projects
# Response: 401 Unauthorized
```

**Invalid Organization:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "wrong",
    "organizationId": "invalid"
  }'
# Response: 401 Invalid credentials
```

**Unauthorized Action (Employee trying to create project):**
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer <employee-token>"
# Response: 403 Admin access required
```

---

## 📊 Postman Collection

Import this into Postman:

```json
{
  "info": {
    "name": "Project Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Create Organization",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/create-organization"
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/login"
          }
        }
      ]
    }
  ]
}
```

---

## ✅ Health Check

```bash
# Test backend is running
curl http://localhost:5000

# Should see: "Cannot GET /" (OK - server running)
# Or implement a health endpoint:
GET /api/health
# Response: { "status": "ok" }
```

---

**Happy Testing!** 🧪
