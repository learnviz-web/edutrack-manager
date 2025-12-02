# 🎓 Student Management System

A simple and beginner-friendly web application for managing students, courses, and enrollments.

---

## 📋 Project Overview

This Student Management System is a full-stack web application that allows educational institutions to manage:
- **Students**: Add, edit, delete, and search student records
- **Courses**: Manage course catalog with details like credits and capacity
- **Enrollments**: Link students with courses and track grades

---

## 🛠️ Technologies Used

### Frontend
- **React** - JavaScript library for building user interfaces
- **TypeScript** - Typed JavaScript for better code quality
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Shadcn UI** - Reusable component library

### Backend
- **Supabase** - Backend-as-a-Service (like Firebase)
  - PostgreSQL database
  - Authentication system
  - Row-Level Security (RLS) for data protection

### Tools
- **Vite** - Fast build tool and development server
- **React Router** - For page navigation
- **React Hook Form** - Form state management

---

## ✨ Key Features

### 1. **Authentication System**
- Secure login and signup
- Email/password authentication
- Protected routes (only logged-in users can access)

### 2. **Student Management**
- Add new students with details (ID, name, email, enrollment date)
- Edit existing student information
- Delete students
- Search students by name, ID, or email
- Status tracking (active/inactive)

### 3. **Course Management**
- Create courses with code, title, and description
- Set credits and maximum capacity
- Track course status
- Search courses by code or title

### 4. **Enrollment Management**
- Enroll students in courses
- Assign grades
- Track enrollment status (enrolled/completed)
- View enrollment history

### 5. **Responsive Design**
- Works on desktop, tablet, and mobile devices
- Clean and modern user interface
- Easy-to-use navigation

---

## 📂 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   └── DashboardLayout.tsx    # Main layout with sidebar
│   └── ui/                         # Reusable UI components (buttons, inputs, etc.)
├── contexts/
│   └── AuthContext.tsx             # Authentication state management
├── pages/
│   ├── Auth.tsx                    # Login/Signup page
│   ├── Dashboard.tsx               # Dashboard with statistics
│   ├── Students.tsx                # Student management page
│   ├── Courses.tsx                 # Course management page
│   ├── Enrollments.tsx             # Enrollment management page
│   └── Index.tsx                   # Landing page
├── integrations/
│   └── supabase/
│       ├── client.ts               # Supabase client configuration
│       └── types.ts                # Database type definitions
└── App.tsx                         # Main app component with routing
```

---

## 🗄️ Database Schema

### Students Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| student_id | TEXT | Student ID (unique) |
| first_name | TEXT | First name |
| last_name | TEXT | Last name |
| email | TEXT | Email address (unique) |
| enrollment_date | DATE | Date enrolled |
| status | TEXT | active or inactive |

### Courses Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| course_code | TEXT | Course code (unique) |
| title | TEXT | Course title |
| description | TEXT | Course description |
| department | TEXT | Department name |
| credits | INTEGER | Number of credits |
| max_capacity | INTEGER | Maximum students |
| status | TEXT | active or inactive |

### Enrollments Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| student_id | UUID | Foreign key to students |
| course_id | UUID | Foreign key to courses |
| enrolled_at | TIMESTAMP | Enrollment date |
| grade | TEXT | Student's grade |
| status | TEXT | enrolled or completed |

---

## 🚀 How to Run the Project

### Prerequisites
- Node.js (v16 or higher)
- npm or bun package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd <project-folder>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173`

### First Time Setup

1. **Create an account**
   - Click on "Get Started" on the landing page
   - Go to the "Sign Up" tab
   - Enter your details and create an account

2. **Sign in**
   - Use your email and password to login
   - You'll be redirected to the dashboard

3. **Start managing data**
   - Add students, courses, and enrollments
   - Explore the different pages using the sidebar

---

## 📊 How the System Works

### Authentication Flow
1. User visits the website
2. User creates an account or logs in
3. System checks credentials with Supabase
4. If valid, user gets access to the dashboard
5. Only authenticated users can view/modify data

### CRUD Operations
**CRUD** = Create, Read, Update, Delete

Example: Adding a Student
1. Click "Add Student" button
2. Fill in the form (Student ID, Name, Email, etc.)
3. Click "Add"
4. System sends data to Supabase database
5. Database stores the record
6. Page refreshes to show the new student

### Database Relationships
- **One-to-Many**: One student can have many enrollments
- **One-to-Many**: One course can have many enrollments
- **Foreign Keys**: Enrollments link students to courses

---

## 🎯 Security Features

1. **Authentication Required**
   - All pages (except landing and login) require authentication
   - Unauthenticated users are redirected to login

2. **Row-Level Security (RLS)**
   - Database policies ensure users can only access their data
   - Prevents unauthorized access

3. **Input Validation**
   - Email format validation
   - Required field validation
   - Unique constraints (no duplicate student IDs)

---

## 📖 Presentation Guide

### What to Say About Your Project

**Opening Statement:**
"I built a Student Management System using React and Supabase. It allows staff to manage students, courses, and enrollments through a secure web interface."

### Key Points to Highlight

1. **Full-Stack Application**
   - Frontend: React with TypeScript
   - Backend: Supabase (PostgreSQL database)
   - Authentication: Secure login system

2. **CRUD Operations**
   - Create: Add new students, courses, enrollments
   - Read: View and search records
   - Update: Edit existing information
   - Delete: Remove records

3. **Database Design**
   - Three main tables: Students, Courses, Enrollments
   - Foreign keys link enrollments to students and courses
   - Proper data relationships

4. **User Experience**
   - Responsive design (works on all devices)
   - Search functionality
   - Real-time data updates
   - Clear error messages

---

## 💡 Common Questions & Answers

### Technical Questions

**Q: Why did you choose React?**
A: React is the most popular frontend library, used by Facebook, Netflix, and Airbnb. It makes building interactive UIs easier with reusable components.

**Q: What is Supabase?**
A: Supabase is an open-source backend service similar to Firebase. It provides a PostgreSQL database, authentication, and security features without needing to set up a server.

**Q: How does authentication work?**
A: When a user logs in, Supabase verifies their email and password. If valid, it returns a session token that's stored in the browser. This token is sent with every request to prove the user is logged in.

**Q: What is Row-Level Security (RLS)?**
A: RLS is a database feature that controls who can access which rows of data. In our system, it ensures users can only see and modify data they're authorized to access.

**Q: What is CRUD?**
A: CRUD stands for Create, Read, Update, Delete - the four basic operations for managing data in any system.

**Q: How do you prevent duplicate student IDs?**
A: The database has a "unique constraint" on the student_id column. If someone tries to add a student with an existing ID, the database rejects it and shows an error message.

**Q: What is TypeScript?**
A: TypeScript is JavaScript with type checking. It catches errors during development rather than at runtime, making the code more reliable.

**Q: Why Tailwind CSS?**
A: Tailwind is a utility-first CSS framework that makes styling faster by using pre-defined classes instead of writing custom CSS.

### Project-Specific Questions

**Q: Can multiple people use this at the same time?**
A: Yes, because it's a web application with a cloud database, multiple users can access it simultaneously.

**Q: What happens if a student is deleted?**
A: The student record is permanently removed from the database. Their enrollments are also deleted due to foreign key constraints.

**Q: Can you export the data?**
A: Currently no, but it would be easy to add an export feature using the existing data.

**Q: How scalable is this?**
A: The system can handle thousands of students and courses. Supabase automatically scales the database as needed.

---

## 🎓 Learning Outcomes

By building this project, I learned:

1. **Frontend Development**
   - React components and state management
   - TypeScript for type-safe code
   - Responsive design with Tailwind CSS

2. **Backend Development**
   - Database design and relationships
   - SQL queries and data modeling
   - Authentication and authorization

3. **Full-Stack Integration**
   - Connecting frontend to backend
   - RESTful API concepts
   - Error handling

4. **Software Engineering**
   - Project structure and organization
   - Version control with Git
   - Debugging techniques

---

## 🔮 Future Enhancements

Possible features to add:
- [ ] Data export to Excel/PDF
- [ ] Email notifications
- [ ] Grade statistics and reports
- [ ] Attendance tracking
- [ ] Parent portal
- [ ] Course scheduling
- [ ] Payment integration

---

## 📝 Code Highlights

### Simple Authentication Check
```typescript
// Protect routes - redirect to login if not authenticated
if (!user) {
  return <Navigate to="/auth" replace />;
}
```

### Database Query Example
```typescript
// Fetch all students, ordered by newest first
const { data, error } = await supabase
  .from('students')
  .select('*')
  .order('created_at', { ascending: false });
```

### Search Functionality
```typescript
// Filter students based on search term
const filteredStudents = students.filter((student) =>
  student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  student.last_name.toLowerCase().includes(searchTerm.toLowerCase())
);
```

---

## 👨‍💻 Development Tips

If you need to modify the project:

1. **Adding a new field to students**
   - Update database schema
   - Add field to form in Students.tsx
   - Update TypeScript interface

2. **Changing colors**
   - Edit `src/index.css` for theme colors
   - Uses CSS variables for consistency

3. **Adding a new page**
   - Create new file in `src/pages/`
   - Add route in `App.tsx`
   - Add navigation link in `DashboardLayout.tsx`

---

## 📞 Support

For questions about the code:
1. Check the comments in each file
2. Review the Supabase documentation: https://supabase.com/docs
3. Check React documentation: https://react.dev

---

## 📄 License

This project is for educational purposes.

---

**Built with ❤️ for learning purposes**
