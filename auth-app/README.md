# Authentication App - User Guide

## Project Structure

```
auth-app/
├── backend/          # Node.js + Express + SQLite
│   ├── server.js     # Main server file
│   ├── database.js   # SQLite setup and initialization
│   ├── package.json  # Backend dependencies
│   ├── .env          # Environment variables
│   ├── middleware/
│   │   └── auth.js   # JWT authentication middleware
│   └── routes/
│       └── auth.js   # Authentication routes (signup, login, profile)
└── frontend/         # React application
    ├── package.json  # Frontend dependencies
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js  # React entry point
        ├── App.js    # Main app component with routing
        ├── components/
        │   ├── Login.js      # Login page
        │   ├── Signup.js     # Sign up page
        │   ├── Dashboard.js  # User dashboard
        │   └── Auth.css      # Styling for auth pages
        └── services/
            └── api.js        # API service for backend communication
```

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
npm start
```

The backend will run on `http://localhost:5000`

**Backend API Endpoints:**
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/profile` - Get user profile (requires authentication)

### 2. Frontend Setup (in a new terminal)

```bash
cd frontend
npm install
npm start
```

The frontend will run on `http://localhost:3000`

## Features

### Authentication
- ✅ User registration with First Name, Last Name, Date of Birth, Email, Password
- ✅ Password hashing using bcryptjs
- ✅ JWT token-based authentication
- ✅ SQLite database for storing user data
- ✅ Form validation
- ✅ Protected routes

### Pages
- **Login Page** - Email and password authentication
- **Sign Up Page** - Full registration form with validation
- **Dashboard** - Protected user profile page with logout

## Database Schema

**Users Table:**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  dateOfBirth TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

## Security Features

- Passwords are hashed using bcryptjs (10 salt rounds)
- JWT tokens expire after 7 days
- Protected API routes require valid authentication token
- Email validation and uniqueness check
- Password confirmation validation
- CORS enabled for frontend-backend communication

## How to Use

1. **Sign Up:**
   - Go to http://localhost:3000/signup
   - Fill in all required fields
   - Passwords must match
   - Submit the form

2. **Login:**
   - Go to http://localhost:3000/login
   - Enter email and password
   - Click Login

3. **View Profile:**
   - After login, you'll see your dashboard
   - Your profile information is displayed
   - Click Logout to return to login page

## Technologies Used

### Backend
- Node.js
- Express.js
- SQLite3
- bcryptjs (password hashing)
- jsonwebtoken (JWT)
- express-validator (form validation)
- CORS

### Frontend
- React 18
- React Router DOM v6
- Axios
- CSS3

## Environment Variables

Create a `.env` file in the backend directory:

```
PORT=5000
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

## Next Steps

- Add email verification functionality
- Implement password reset
- Add user profile update functionality
- Implement refresh tokens
- Add role-based access control
- Deploy to production
