# Drizzle ORM Models

This directory contains all the database schema definitions for the school management system using Drizzle ORM with MySQL.

## 📁 File Structure

```
src/models/
├── index.models.js          # Central export file
├── users.js          # Users, roles, and permissions
├── attendance.js     # Attendance and guests
├── academic.js       # Academic years, surveys, and principal agendas
├── classes.js        # Departments and classes
├── relations.js      # Table relationships
└── README.md         # This file
```

## 🗃️ Database Tables

### Core Tables
- **`users`** - User accounts (students, staff, admin)
- **`roles`** - User roles (Admin, KepalaSekolah, Staff, Student)
- **`role_permissions`** - CRUD permissions for each role

### Attendance & Visitors
- **`attendance`** - Daily attendance tracking
- **`guests`** - Visitor registration

### Academic Management
- **`academic_years`** - School academic years
- **`surveys`** - Survey forms
- **`survey_responses`** - Survey answers
- **`principal_agendas`** - Principal's schedule

### Class Management
- **`departments`** - School departments/majors
- **`classes`** - Class definitions with grades

## 🚀 Usage Examples

### Basic Import

```javascript
import { db } from '../config/database.js';
import { users, roles, attendance } from './models/index.models.js';
```

### Using with Database Instance

```javascript
import { db } from '../config/database.js';
import { schema } from './models/index.models.js';

// Initialize Drizzle with schema (for relations)
const dbWithSchema = drizzle(pool, { schema });
```

### CRUD Operations

#### Create User
```javascript
import { users, roles } from './models/index.models.js';

const newUser = await db.insert(users).values({
  full_name: 'John Doe',
  email: 'john@school.edu',
  id_role: 3, // Student role
  data: { grade: '10A', studentId: 'STD001' }
});
```

#### Query with Relations
```javascript
import { users } from './models/index.models.js';

const usersWithRoles = await db.query.users.findMany({
  with: {
    role: true,
    attendance: true,
  },
});
```

#### Complex Query
```javascript
import { users, attendance, roles } from './models/index.models.js';
import { eq, and, gte } from 'drizzle-orm';

const studentAttendance = await db
  .select({
    userName: users.full_name,
    roleName: roles.name,
    attendanceDate: attendance.date,
    status: attendance.status,
  })
  .from(users)
  .innerJoin(roles, eq(users.id_role, roles.id))
  .innerJoin(attendance, eq(attendance.id_user, users.id))
  .where(
    and(
      eq(roles.name, 'Student'),
      gte(attendance.date, '2024-01-01')
    )
  );
```

#### Survey Management
```javascript
import { surveys, surveyResponses, academicYears } from './models/index.models.js';

// Create survey for current academic year
const survey = await db.insert(surveys).values({
  title: 'Student Satisfaction Survey',
  description: 'Annual student feedback survey',
  id_academic_year: 1,
});

// Add survey response
const response = await db.insert(surveyResponses).values({
  id_survey: survey.insertId,
  question: 'How satisfied are you with the teaching quality?',
  score: 4,
  surveyor_name: 'Jane Student',
  surveyor_details: 'Grade 11, Science Department',
});
```

#### Class and Department Management
```javascript
import { classes, departments, academicYears } from './models/index.models.js';

// Get all classes with department and academic year info
const classesWithDetails = await db.query.classes.findMany({
  with: {
    department: true,
    academicYear: true,
  },
});
```

### Attendance Tracking
```javascript
import { attendance, users } from './models/index.models.js';
import { eq } from 'drizzle-orm';

// Mark attendance
const todayAttendance = await db.insert(attendance).values({
  id_user: 123,
  date: new Date().toISOString().split('T')[0],
  status: 'hadir',
});

// Get user attendance history
const userAttendance = await db.query.attendance.findMany({
  where: eq(attendance.id_user, 123),
  with: {
    user: true,
  },
  orderBy: (attendance, { desc }) => [desc(attendance.date)],
});
```

## 🔗 Relationships

The models include the following relationships:

- `users` → `roles` (many-to-one)
- `users` → `attendance` (one-to-many)
- `roles` → `role_permissions` (one-to-many)
- `surveys` → `academic_years` (many-to-one)
- `surveys` → `survey_responses` (one-to-many)
- `classes` → `departments` (many-to-one)
- `classes` → `academic_years` (many-to-one)

## 📝 Schema Features

### Timestamps
All tables include:
- `created_at` - Auto-set on creation
- `updated_at` - Auto-updated on modification
- `deleted_at` - For soft deletes

### Data Types
- **MySQL-specific types**: `mysqlTable`, `mysqlEnum`
- **Standard types**: `int`, `varchar`, `text`, `json`, `boolean`
- **Date/Time**: `date`, `datetime`, `timestamp`

### Constraints
- Primary keys with auto-increment
- Foreign key relationships
- Unique constraints (e.g., user email)
- Default values where appropriate

## 🛠️ Development Tips

1. **Import from index.models.js** for cleaner imports
2. **Use relations** for complex queries with joins
3. **Leverage TypeScript** for better type safety
4. **Use transactions** for multi-table operations
5. **Implement soft deletes** using `deleted_at` field
