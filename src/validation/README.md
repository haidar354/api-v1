# Validation System

This directory contains comprehensive Zod validation schemas and Hono validators for the school management system API.

## 📁 File Structure

```
src/validation/
├── index.js          # Central export file with validators object
├── auth.js           # Authentication validation (login, etc.)
├── users.js          # Users, roles, and permissions validation
├── attendance.js     # Attendance and guests validation
├── academic.js       # Academic years, surveys, and principal agendas
├── classes.js        # Departments and classes validation
└── README.md         # This file
```

## 🔧 Features

- ✅ **Comprehensive validation** for all database tables
- ✅ **Authentication validation** (login, password management)
- ✅ **Type-safe schemas** with Zod
- ✅ **Hono middleware integration** with `@hono/zod-validator`
- ✅ **Input sanitization** and transformation
- ✅ **Custom error messages** for better UX
- ✅ **Bulk operations** validation
- ✅ **Query parameter** validation
- ✅ **Date and time** validation
- ✅ **Business logic** validation

## 🚀 Usage Examples

### Basic Import

```javascript
import { validators } from '../validation/index.js';
import { validateLogin, validateCreateUser } from '../validation/index.js';
```

### In Hono Routes

```javascript
import { Hono } from 'hono';
import { validators } from '../validation/index.js';

const app = new Hono();

// Authentication routes
app.post('/auth/login', validators.auth.login, async (c) => {
  const { email, password } = c.req.valid('json');
  // Login logic here
});

// User management routes
app.post('/users', validators.users.create, async (c) => {
  const userData = c.req.valid('json');
  // Create user logic here
});

app.get('/users/:id', validators.users.id, async (c) => {
  const { id } = c.req.valid('param');
  // Get user by ID logic here
});

app.get('/users', validators.users.query, async (c) => {
  const queryParams = c.req.valid('query');
  // List users with pagination and filtering
});
```

### Advanced Usage with Custom Validation

```javascript
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { userSchema } from '../validation/users.js';

// Extend existing schema
const customUserSchema = userSchema.extend({
  department: z.string().min(1, 'Department is required'),
});

const validateCustomUser = zValidator('json', customUserSchema);

app.post('/custom-users', validateCustomUser, async (c) => {
  const userData = c.req.valid('json');
  // Custom user creation logic
});
```

## 📋 Validation Categories

### 🔐 Authentication (`auth.js`)

- **Login**: Email and password validation
- **Password Management**: Change, reset, forgot password flows
- **Profile Updates**: User profile modification
- **2FA**: Two-factor authentication support

```javascript
// Login validation
{
  email: "user@example.com",
  password: "securePassword123"
}

// Registration validation
{
  full_name: "John Doe",
  email: "john@example.com",
  password: "SecurePass123",
  confirmPassword: "SecurePass123",
  id_role: 3
}
```

### 👥 Users & Roles (`users.js`)

- **Users**: Full name, email, role assignment, JSON data
- **Roles**: Role name validation
- **Role Permissions**: CRUD permissions per role
- **Bulk Operations**: Multiple user/permission creation

```javascript
// User creation
{
  full_name: "Jane Smith",
  email: "jane@school.edu",
  id_role: 2,
  data: { grade: "10A", studentId: "STD001" }
}

// Role permission
{
  id_role: 1,
  tableName: "users",
  can_create: true,
  can_read: true,
  can_update: false,
  can_delete: false
}
```

### 📅 Attendance & Guests (`attendance.js`)

- **Attendance**: User ID, date, status enum validation
- **Guests**: Visitor information and visit scheduling
- **Bulk Attendance**: Multiple attendance records
- **Reports**: Attendance report generation

```javascript
// Attendance record
{
  id_user: 123,
  date: "2024-01-15",
  status: "hadir"
}

// Guest registration
{
  full_name: "Dr. Smith",
  address: "123 Main St",
  purpose: "Parent-teacher conference",
  visit_date: "2024-01-20T10:00:00Z"
}
```

### 🎓 Academic Management (`academic.js`)

- **Academic Years**: Year format (2024/2025), active status
- **Surveys**: Title, description, academic year association
- **Survey Responses**: Questions, scores, surveyor information
- **Principal Agendas**: Event scheduling and management

```javascript
// Academic year
{
  year: "2024/2025",
  is_active: true
}

// Survey response
{
  id_survey: 1,
  question: "How satisfied are you with teaching quality?",
  score: 8,
  surveyor_name: "John Student",
  surveyor_details: "Grade 11, Science Department"
}
```

### 🏫 Classes & Departments (`classes.js`)

- **Departments**: Department name validation
- **Classes**: Grade, department, academic year, subgrade
- **Class Assignments**: Teacher/student assignments
- **Schedules**: Class scheduling with time validation

```javascript
// Class creation
{
  grade: "10",
  id_department: 1,
  subgrade: "A",
  id_academic_year: 1
}

// Class schedule
{
  classId: 1,
  subject: "Mathematics",
  teacherId: 5,
  dayOfWeek: "monday",
  startTime: "08:00",
  endTime: "09:30",
  room: "Room 101"
}
```

## 🛡️ Validation Features

### Input Sanitization
- **Trimming**: Automatic whitespace removal
- **Case normalization**: Email lowercase, grade uppercase
- **Data transformation**: String to number conversion

### Business Logic Validation
- **Date ranges**: Reasonable date constraints
- **Unique constraints**: Duplicate prevention
- **Relationship validation**: Foreign key existence
- **Role-based validation**: Permission-based field requirements

### Error Handling
- **Descriptive messages**: Clear validation error descriptions
- **Field-specific errors**: Pinpoint exact validation failures
- **Custom refinements**: Complex business rule validation

## 🔧 Validation Patterns

### Common Patterns Available

```javascript
import { validationPatterns } from '../validation/index.js';

// ID validation
const userIdSchema = z.object(validationPatterns.id('userId'));

// Pagination
const paginationSchema = z.object(validationPatterns.pagination);

// Date range
const dateRangeSchema = z.object(validationPatterns.dateRange);

// Search
const searchSchema = z.object({ search: validationPatterns.search });
```

### Custom Middleware Factory

```javascript
import { createValidationMiddleware } from '../validation/index.js';

// Create CRUD middleware
const userValidation = createValidationMiddleware.crud(validators.users);

// Use in routes
app.post('/users', userValidation.create, handler);
app.put('/users/:id', userValidation.id, userValidation.update, handler);
```

## 📝 Best Practices

1. **Always validate input**: Use validators on all routes
2. **Handle validation errors**: Implement proper error responses
3. **Use type-safe data**: Access validated data with `c.req.valid()`
4. **Extend schemas**: Build on existing schemas for custom needs
5. **Test validation**: Write tests for validation logic
6. **Document requirements**: Keep validation rules documented

## 🔍 Error Response Format

When validation fails, Hono returns structured error responses:

```json
{
  "success": false,
  "error": {
    "issues": [
      {
        "code": "invalid_type",
        "expected": "string",
        "received": "number",
        "path": ["email"],
        "message": "Expected string, received number"
      }
    ]
  }
}
```

## 🚀 Performance Tips

- **Use specific validators**: Import only needed validators
- **Cache validation results**: Avoid re-validating same data
- **Optimize regex patterns**: Use efficient regular expressions
- **Limit array sizes**: Set reasonable limits for bulk operations
