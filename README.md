# Fatec Conecta API

A RESTful API for managing users, ideas, and projects with role-based access control.

## Features

- **User Management** with 4 roles:
  - Student
  - Community
  - Staff-Admin
  - Staff-Supervisor
- **Session-based Authentication**
- **Ideas Management** (Community users only)
- **Projects Management** with business rules
- **SQLite Database** for data persistence

## Installation

```bash
npm install
```

## Configuration

Copy the `.env.example` file to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `SESSION_SECRET`: Secret key for session encryption (required in production)

## Running the Application

```bash
npm start
```

The server will start on port 3000 (or the PORT environment variable if set).

## API Endpoints

### Users

#### Register
```
POST /api/users/register
Content-Type: application/json

{
  "username": "john",
  "email": "john@example.com",
  "password": "password123",
  "role": "Student"
}
```

#### Login
```
POST /api/users/login
Content-Type: application/json

{
  "username": "john",
  "password": "password123"
}
```

#### Logout
```
POST /api/users/logout
```

#### Get All Users
```
GET /api/users
```

#### Get User by ID
```
GET /api/users/:id
```

#### Update User
```
PUT /api/users/:id
Content-Type: application/json

{
  "username": "newusername",
  "email": "newemail@example.com",
  "role": "Community"
}
```

#### Delete User
```
DELETE /api/users/:id
```

### Ideas

**Note:** Only Community users can create ideas.

#### Create Idea
```
POST /api/ideas
Content-Type: application/json

{
  "title": "New Idea",
  "description": "Description of the idea"
}
```

#### Get All Ideas
```
GET /api/ideas
```

#### Get Idea by ID
```
GET /api/ideas/:id
```

#### Update Idea
```
PUT /api/ideas/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}
```

#### Delete Idea
```
DELETE /api/ideas/:id
```

### Projects

**Note:** Only Staff users (Admin and Supervisor) can create projects.

#### Create Project
```
POST /api/projects
Content-Type: application/json

{
  "title": "New Project",
  "description": "Project description",
  "ideaId": 1  // Optional: Can be created from an idea
}
```

#### Get All Projects
```
GET /api/projects
```

#### Get Project by ID
```
GET /api/projects/:id
```

#### Update Project
```
PUT /api/projects/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}
```

#### Delete Project
```
DELETE /api/projects/:id
```

## Business Rules

1. **User Roles:**
   - Student: Can view ideas and projects
   - Community: Can create, update, and delete their own ideas
   - Staff-Admin: Can create projects with or without ideas
   - Staff-Supervisor: Can create projects with or without ideas

2. **Ideas:**
   - Only Community users can create new ideas
   - Users can only update/delete their own ideas

3. **Projects:**
   - Only Staff users (Admin and Supervisor) can create projects
   - Staff can create projects without an idea
   - Students and Community users cannot create projects
   - Projects can be adapted from existing ideas

## Database Schema

### Users Table
- id (PRIMARY KEY)
- username (UNIQUE)
- email (UNIQUE)
- password (hashed)
- role (Student, Community, Staff-Admin, Staff-Supervisor)
- created_at
- updated_at

### Ideas Table
- id (PRIMARY KEY)
- title
- description
- user_id (FOREIGN KEY -> users.id)
- created_at
- updated_at

### Projects Table
- id (PRIMARY KEY)
- title
- description
- user_id (FOREIGN KEY -> users.id)
- idea_id (FOREIGN KEY -> ideas.id, nullable)
- created_at
- updated_at

## Technologies Used

- Node.js
- Express.js
- SQLite3
- express-session (for session management)
- bcryptjs (for password hashing)