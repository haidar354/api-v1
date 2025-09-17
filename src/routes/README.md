# Users CRUD Module

Complete CRUD functionality for user management with service layer, controller, and routes using Drizzle ORM, bcryptjs, and Hono validation.

## 📁 File Structure

```
src/
├── services/
│   └── users.service.js      # Business logic and database operations
├── controllers/
│   └── users.controller.js   # HTTP request handlers
├── routes/
│   └── users.route.js        # API route definitions
└── validation/
    └── users.js              # Validation schemas (already created)
```

## 🔧 Features

- ✅ **Full CRUD Operations**: Create, Read, Update, Delete users
- ✅ **Password Hashing**: Secure password storage with bcryptjs (12 salt rounds)
- ✅ **Soft Delete**: Users marked as deleted with `deleted_at` timestamp
- ✅ **Relations**: Include role data in user queries
- ✅ **Validation**: Comprehensive input validation with Zod
- ✅ **Pagination**: Efficient pagination with metadata
- ✅ **Search & Filtering**: Search by name/email, filter by role
- ✅ **Bulk Operations**: Create multiple users at once
- ✅ **Error Handling**: Consistent error responses
- ✅ **Health Checks**: Service health monitoring

## 🚀 API Endpoints

### Core CRUD Operations

| Method | Endpoint | Description | Validation |
|--------|----------|-------------|------------|
| `GET` | `/users` | Get all users with pagination | Query params |
| `POST` | `/users` | Create new user | User data |
| `GET` | `/users/:id` | Get user by ID | User ID |
| `PUT` | `/users/:id` | Update user | User ID + data |
| `DELETE` | `/users/:id` | Soft delete user | User ID |

### Additional Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users/health` | Service health check |
| `GET` | `/users/stats/roles` | User count by role |
| `GET` | `/users/search` | Search users |
| `POST` | `/users/bulk` | Bulk create users |
| `GET` | `/users/role/:roleId` | Get users by role |
| `POST` | `/users/:id/restore` | Restore deleted user |

## 📝 Usage Examples

### Create User

```bash
POST /users
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@school.edu",
  "password": "SecurePass123",
  "id_role": 3,
  "data": {
    "grade": "10A",
    "studentId": "STD001"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@school.edu",
    "id_role": 3,
    "data": { "grade": "10A", "studentId": "STD001" },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "error": null
}
```

### Get All Users with Pagination

```bash
GET /users?page=1&limit=10&search=john&role=3&sortBy=created_at&sortOrder=desc
```

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "full_name": "John Doe",
      "email": "john@school.edu",
      "id_role": 3,
      "data": { "grade": "10A" },
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "role": {
        "id": 3,
        "name": "Student"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 45,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "error": null
}
```

### Get User by ID

```bash
GET /users/1?include_role=true
```

**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@school.edu",
    "id_role": 3,
    "data": { "grade": "10A" },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "role": {
      "id": 3,
      "name": "Student"
    }
  },
  "error": null
}
```

### Update User

```bash
PUT /users/1
Content-Type: application/json

{
  "full_name": "John Smith",
  "data": {
    "grade": "11A",
    "studentId": "STD001"
  }
}
```

### Bulk Create Users

```bash
POST /users/bulk
Content-Type: application/json

{
  "users": [
    {
      "full_name": "Alice Johnson",
      "email": "alice@school.edu",
      "password": "SecurePass123",
      "id_role": 3
    },
    {
      "full_name": "Bob Wilson",
      "email": "bob@school.edu", 
      "password": "SecurePass123",
      "id_role": 3
    }
  ]
}
```

### Search Users

```bash
GET /users/search?q=john&limit=5
```

### Soft Delete User

```bash
DELETE /users/1
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": 1,
    "deleted": true
  },
  "error": null
}
```

### Restore User

```bash
POST /users/1/restore
```

## 🔐 Security Features

### Password Hashing
- Uses bcryptjs with 12 salt rounds
- Passwords never returned in API responses
- Secure password verification for authentication

### Input Validation
- Email format validation
- Password strength requirements
- Data sanitization and transformation
- SQL injection prevention through Drizzle ORM

### Soft Delete
- Users are never permanently deleted
- `deleted_at` timestamp for audit trails
- Restore functionality for accidental deletions

## 🗄️ Database Operations

### Service Layer Methods

```javascript
import { UsersService } from '../services/users.service.js';

// Create user with hashed password
const user = await UsersService.createUser(userData);

// Get users with relations and pagination
const result = await UsersService.getAllUsers({
  page: 1,
  limit: 10,
  search: 'john',
  role: '3',
  include_role: true
});

// Get user by ID with role data
const user = await UsersService.getUserById(1, true);

// Update user
const updated = await UsersService.updateUser(1, updateData);

// Soft delete
const deleted = await UsersService.deleteUser(1);

// Restore user
const restored = await UsersService.restoreUser(1);

// Authentication helpers
const user = await UsersService.getUserByEmail('john@school.edu');
const isValid = await UsersService.verifyPassword('password', hashedPassword);
```

## 🔗 Integration

### In Main App

```javascript
import { Hono } from 'hono';
import { usersRoute } from './routes/users.route.js';

const app = new Hono();

// Mount users routes
app.route('/api/users', usersRoute);

export default app;
```

### Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Failed to create user",
  "data": null,
  "error": "Email already exists"
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error
- `207` - Multi-Status (bulk operations with partial success)

## 📊 Query Parameters

### GET /users

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number | 1 |
| `limit` | number | Items per page (1-100) | 10 |
| `search` | string | Search in name/email | - |
| `role` | number | Filter by role ID | - |
| `sortBy` | string | Sort field | created_at |
| `sortOrder` | string | asc/desc | desc |

### GET /users/:id

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `include_role` | boolean | Include role data | true |

## 🧪 Testing Examples

```javascript
// Test user creation
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    full_name: 'Test User',
    email: 'test@school.edu',
    password: 'TestPass123',
    id_role: 3
  })
});

// Test pagination
const users = await fetch('/api/users?page=1&limit=5');

// Test search
const searchResults = await fetch('/api/users/search?q=john');
```

## 🚀 Performance Tips

1. **Use pagination** for large datasets
2. **Include role data** only when needed
3. **Use search** instead of fetching all users
4. **Implement caching** for frequently accessed data
5. **Monitor database** connection pool usage

## 🔧 Maintenance

- **Soft deletes** allow data recovery
- **Audit trails** through timestamps
- **Health checks** for monitoring
- **Statistics endpoints** for analytics
- **Bulk operations** for data migration
