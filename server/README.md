# Student Management System - Backend API

A comprehensive Node.js/Express backend for the Student Management System with MongoDB database integration.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Students, Admins, and Superadmin roles
- **Group Management**: Organize students into groups with assigned admins
- **Project Submission**: Students can submit projects for review
- **XP & Leveling System**: Gamified learning with XP points and levels
- **Leaderboards**: Individual and group performance tracking
- **RESTful API**: Clean, well-documented API endpoints

## 📦 Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **Password Hashing**: bcryptjs
- **CORS**: Enabled for frontend integration

## 🏗️ Project Structure

```
server/
├── models/           # Database models (User, Group, Project, AdminTask)
├── routes/           # API route handlers
├── middlewares/      # Custom middleware (auth, error handling)
├── controllers/      # Controller functions (optional structure)
├── package.json      # Dependencies and scripts
├── index.js          # Main server file
├── .env.example      # Environment variables template
└── README.md         # This file
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Step 1: Install Dependencies
```bash
cd server
npm install
```

### Step 2: Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/student_management
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
FRONTEND_URL=https://c8cb6619-284d-4e25-9abe-3fbf8df9c33a.lovableproject.com
```

### Step 3: Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas (cloud) - update MONGODB_URI accordingly
```

### Step 4: Start the Server
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 🔐 Authentication

### Login Endpoints
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/register` - User registration

### Demo Credentials
- **Superadmin**: `username: superadmin`, `password: demo123`

### JWT Token Usage
Include the JWT token in request headers:
```
Authorization: Bearer <your-jwt-token>
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user

### Students
- `GET /api/students` - Get all students (admin/superadmin)
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `POST /api/students/:id/give-xp` - Award XP to student

### Admins
- `GET /api/admins` - Get all admins (superadmin only)
- `GET /api/admins/:id` - Get admin by ID
- `POST /api/admins` - Create new admin
- `PUT /api/admins/:id` - Update admin
- `DELETE /api/admins/:id` - Delete admin
- `PUT /api/admins/:id/assign-group` - Assign admin to group
- `PUT /api/admins/:id/remove-group` - Remove admin from group

### Groups
- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get group by ID
- `POST /api/groups` - Create new group
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

### Projects
- `GET /api/projects` - Get projects (filtered by role)
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Submit new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Leaderboard
- `GET /api/leaderboard` - Get student leaderboard
- `GET /api/leaderboard/groups` - Get group leaderboard

### Health Check
- `GET /api/health` - Server health check

## 🔑 Authorization Levels

### Student
- View own profile and projects
- Submit projects
- Update own basic information
- View leaderboards

### Admin  
- Manage students in their assigned group
- Review and grade projects in their group
- Award XP to students
- View group analytics

### Superadmin
- Full system access
- Manage all groups, admins, and students
- Create and assign admins to groups
- System-wide analytics

## 🔄 Frontend Integration

### Update Frontend API Calls
Replace your existing Supabase calls with backend API calls:

```javascript
// Before (Supabase)
const { data } = await supabase.from('profiles').select('*');

// After (Backend API)
const response = await fetch('/api/students', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const { data } = await response.json();
```

### Environment Variables for Frontend
Add to your frontend environment:
```env
VITE_API_URL=http://localhost:5000/api
```

## 🎯 XP & Leveling System

- **Base XP per Level**: 100 XP
- **Level Calculation**: `Math.floor(xp / 100) + 1`
- **XP Sources**: Project submissions, admin awards, achievements

## 🔧 Database Schema

### User Model
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: 'student' | 'admin' | 'superadmin',
  groupId: ObjectId (reference to Group),
  xp: Number,
  level: Number,
  isActive: Boolean
}
```

### Group Model
```javascript
{
  name: String (unique),
  description: String,
  adminId: ObjectId (reference to User),
  maxStudents: Number,
  isActive: Boolean
}
```

### Project Model
```javascript
{
  title: String,
  description: String,
  studentId: ObjectId (reference to User),
  groupId: ObjectId (reference to Group),
  githubUrl: String,
  liveUrl: String,
  technologies: [String],
  status: 'submitted' | 'under_review' | 'approved' | 'rejected',
  xpAwarded: Number,
  reviewNotes: String,
  reviewedBy: ObjectId,
  reviewedAt: Date
}
```

## 🚨 Error Handling

The API includes comprehensive error handling:
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

## 📈 Development

### Adding New Features
1. Create model in `/models` if needed
2. Add routes in `/routes`
3. Implement middleware in `/middlewares` if required
4. Update this README

### Database Indexes
Important indexes are automatically created:
- User: `username`, `email`, `role`, `groupId`
- Group: `adminId`, `isActive`
- Project: `studentId`, `groupId`, `status`, `createdAt`

## 🔍 Monitoring

### Health Check
Visit `http://localhost:5000/api/health` to verify server status.

### Logs
The server logs important events:
- Database connections
- Authentication attempts
- Error details (in development mode)

## 🚀 Production Deployment

### Environment Variables
Ensure all production environment variables are set:
```env
NODE_ENV=production
MONGODB_URI=<your-production-mongodb-uri>
JWT_SECRET=<strong-production-secret>
FRONTEND_URL=<your-production-frontend-url>
```

### Security Considerations
- Use strong JWT secrets
- Enable HTTPS in production
- Implement rate limiting
- Use MongoDB Atlas for database
- Enable proper logging and monitoring

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include validation for all inputs
4. Update this README for new features
5. Test thoroughly before committing

## 📄 License

This project is licensed under the ISC License.