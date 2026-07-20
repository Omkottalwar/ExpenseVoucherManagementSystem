# Expense Voucher Management System

A full-stack web application for managing employee expense vouchers with role-based access control, digital signature capture, and multi-stage approval workflows. Built with **React + Vite** (frontend) and **Node.js + Express + MongoDB** (backend).

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Setup Instructions](#project-setup-instructions)
  - [Prerequisites](#prerequisites)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Seed the Database](#4-seed-the-database)
  - [5. Running the Application](#5-running-the-application)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
  - [User Collection](#user-collection)
  - [Voucher Collection](#voucher-collection)
  - [Counter Collection](#counter-collection)
  - [Entity Relationship Diagram](#entity-relationship-diagram)
- [API Documentation](#api-documentation)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Voucher Endpoints](#voucher-endpoints)
  - [Dashboard Endpoints](#dashboard-endpoints)
- [Voucher Workflow](#voucher-workflow)
- [Role-Based Access Control](#role-based-access-control)
- [Email Service](#email-service)
- [Assumptions Made During Development](#assumptions-made-during-development)
- [Project Structure](#project-structure)
- [Seeded Test Credentials](#seeded-test-credentials)

---

## Project Overview

The Expense Voucher Management System allows organizations to digitize their expense claim process. Employees submit expense vouchers with digital signatures, Directors review and approve/reject them, and the Accounts team manages employee records and oversees all approved expenses.

### Key Features

- **Three Role-Based Portals** — Employee, Director, and Accounts, each with a dedicated login, dashboard, and feature set.
- **Voucher Lifecycle Management** — Create → Draft → Submit (with signature) → Director Review → Approve/Reject.
- **Digital Signature Capture** — Draw or upload signatures via an interactive signature pad. Signatures are mandatory for both submission and approval.
- **Advanced Search & Filters** — Filter vouchers by date range (From/To), status, category, department, employee name, amount range, and voucher number.
- **Employee Management** — Accounts team can register new employees with auto-generated secure passwords and email credential delivery.
- **Forgot / Reset Password** — Secure token-based password reset flow via email for all three portals.
- **Dual Email Service** — Primary SMTP (Gmail/Nodemailer) with Resend API fallback.
- **Role-Based Dashboards** — Aggregated statistics, recent activity feeds, and quick-action cards per role.

---

## Tech Stack

| Layer      | Technology                                                |
| ---------- | --------------------------------------------------------- |
| Frontend   | React 19, Vite 8, React Router 7, Bootstrap 5, Axios     |
| Backend    | Node.js, Express 4, Mongoose 8, JWT, bcryptjs             |
| Database   | MongoDB Atlas (Cloud)                                     |
| Email      | Nodemailer (SMTP) + Resend API (Fallback)                 |
| File Upload| Multer (signature images)                                 |
| Validation | express-validator                                         |
| Dev Tools  | Nodemon, Vite HMR                                         |

---

## Project Setup Instructions

### Prerequisites

- **Node.js** v18+ and **npm** v9+
- A **MongoDB Atlas** cluster (or local MongoDB instance)
- *(Optional)* A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833) for SMTP email delivery
- *(Optional)* A [Resend](https://resend.com) API key for fallback email delivery

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ExpenseVoucherMangement
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory by copying the example:

```bash
cp .env.example .env
```

Update the `.env` file with your actual credentials (see [Environment Variables](#environment-variables)).

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` directory (if it doesn't exist):

```env
VITE_API_URL=http://localhost:5050/api/v1
```

### 4. Seed the Database

Populate the database with sample users and vouchers:

```bash
cd ../backend
npm run seed
```

> **Warning:** The seed script clears all existing data before inserting sample records.

### 5. Running the Application

**Terminal 1 — Backend:**

```bash
cd backend
npm run dev
```

The backend API server starts on `http://localhost:5050`.

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
```

The frontend development server starts on `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable           | Description                                      | Example                                     |
| ------------------ | ------------------------------------------------ | ------------------------------------------- |
| `PORT`             | Express server port                              | `5050`                                      |
| `NODE_ENV`         | Environment mode                                 | `development`                               |
| `MONGODB_URI`      | MongoDB connection string                        | `mongodb+srv://user:pass@cluster0...`       |
| `JWT_SECRET`       | Secret key for JWT signing                       | `a_long_random_string`                      |
| `JWT_EXPIRES_IN`   | Token expiration duration                        | `1d`                                        |
| `CLIENT_URL`       | Frontend URL (for CORS and email links)          | `http://localhost:5173`                     |
| `RESEND_API_KEY`   | Resend API key (fallback mailer)                 | `re_xxxxxxxxxx`                             |
| `RESEND_FROM_EMAIL`| From address for Resend                          | `ExpenseVoucher <onboarding@resend.dev>`    |
| `SMTP_HOST`        | SMTP server hostname                             | `smtp.gmail.com`                            |
| `SMTP_PORT`        | SMTP server port                                 | `587`                                       |
| `SMTP_SECURE`      | Use TLS                                          | `false`                                     |
| `SMTP_USER`        | SMTP sender email                                | `your_email@gmail.com`                      |
| `SMTP_PASS`        | SMTP app password                                | `your_gmail_app_password`                   |
| `SMTP_FROM_EMAIL`  | From address for Nodemailer                      | `ExpenseVoucher <your_email@gmail.com>`     |

### Frontend (`frontend/.env`)

| Variable         | Description        | Example                                |
| ---------------- | ------------------ | -------------------------------------- |
| `VITE_API_URL`   | Backend API base   | `http://localhost:5050/api/v1`         |

---

## Database Schema

The application uses **MongoDB** with **Mongoose** ODM. There are three collections:

### User Collection

Stores all user accounts (Employees, Directors, Accounts staff).

| Field                | Type       | Required | Description                                            |
| -------------------- | ---------- | -------- | ------------------------------------------------------ |
| `name`               | String     | ✅       | Full name of the user                                  |
| `email`              | String     | ✅       | Unique login email (validated with regex)               |
| `password`           | String     | ✅       | Hashed password (bcrypt, min 6 characters)              |
| `role`               | String     | ✅       | One of: `Employee`, `Director`, `Accounts`              |
| `employeeId`         | String     | ❌       | Organization employee ID code                           |
| `department`         | String     | ❌       | Department name                                        |
| `signatureUrl`       | String     | ❌       | Path to the user's profile signature image              |
| `resetPasswordToken` | String     | ❌       | SHA-256 hashed password reset token                     |
| `resetPasswordExpire`| Date       | ❌       | Reset token expiration timestamp                        |
| `createdAt`          | Date       | Auto     | Mongoose timestamp                                     |
| `updatedAt`          | Date       | Auto     | Mongoose timestamp                                     |

**Hooks:**
- `pre('save')` — Automatically hashes the password with bcrypt (10 salt rounds) before saving.
- `matchPassword()` — Instance method to compare entered password against the stored hash.

---

### Voucher Collection

Stores all expense voucher records and tracks their lifecycle.

| Field                  | Type       | Required | Description                                             |
| ---------------------- | ---------- | -------- | ------------------------------------------------------- |
| `voucherNumber`        | String     | ✅       | Auto-generated unique ID (format: `VOU-YYYY-XXXXXX`)    |
| `voucherDate`          | Date       | ✅       | Date the voucher was created (default: now)              |
| `expenseDate`          | Date       | ✅       | Date the expense was incurred                            |
| `departmentName`       | String     | ✅       | Department filing the expense                            |
| `expenseTitle`         | String     | ✅       | Short title of the expense                               |
| `expenseCategory`      | String     | ✅       | One of: `Travel`, `Food`, `Accommodation`, `Office Supplies`, `Other` |
| `expenseDescription`   | String     | ❌       | Detailed description                                     |
| `amount`               | Number     | ✅       | Expense amount (min: 0.01)                               |
| `employee`             | ObjectId   | ✅       | Reference to the User who created the voucher            |
| `employeeName`         | String     | ✅       | Denormalized employee name for fast queries              |
| `employeeIdCode`       | String     | ❌       | Employee's organization ID code                          |
| `employeeSignatureUrl` | String     | ❌       | Path to the employee's signature image for this voucher  |
| `status`               | String     | ✅       | One of: `Draft`, `Submitted`, `PendingApproval`, `Approved`, `Rejected` |
| `directorSignatureUrl` | String     | ❌       | Path to the director's approval signature image          |
| `approvalDate`         | Date       | ❌       | Timestamp when the voucher was approved                  |
| `rejectionReason`      | String     | ❌       | Reason provided by director for rejection                |
| `reviewedBy`           | ObjectId   | ❌       | Reference to the Director User who reviewed              |
| `createdAt`            | Date       | Auto     | Mongoose timestamp                                      |
| `updatedAt`            | Date       | Auto     | Mongoose timestamp                                      |

---

### Counter Collection

Utility collection for generating sequential voucher numbers.

| Field  | Type   | Description                                      |
| ------ | ------ | ------------------------------------------------ |
| `_id`  | String | Counter identifier (e.g., `voucher-2026`)        |
| `seq`  | Number | Current sequence number (auto-incremented)        |

---

### Entity Relationship Diagram

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        String name
        String email UK
        String password
        String role
        String employeeId
        String department
        String signatureUrl
        String resetPasswordToken
        Date resetPasswordExpire
    }

    VOUCHER {
        ObjectId _id PK
        String voucherNumber UK
        Date voucherDate
        Date expenseDate
        String departmentName
        String expenseTitle
        String expenseCategory
        Number amount
        String status
        String employeeSignatureUrl
        String directorSignatureUrl
        Date approvalDate
        String rejectionReason
    }

    COUNTER {
        String _id PK
        Number seq
    }

    USER ||--o{ VOUCHER : "creates (employee)"
    USER ||--o{ VOUCHER : "reviews (reviewedBy)"
```

---

## API Documentation

**Base URL:** `http://localhost:5050/api/v1`

All protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

---

### Authentication Endpoints

| Method | Endpoint                       | Access       | Description                                    |
| ------ | ------------------------------ | ------------ | ---------------------------------------------- |
| POST   | `/auth/register`               | Public       | Register a new user account                    |
| POST   | `/auth/login`                  | Public       | Login and receive JWT token                    |
| GET    | `/auth/me`                     | Private      | Get current authenticated user profile         |
| POST   | `/auth/logout`                 | Private      | Logout (client-side token discard)             |
| POST   | `/auth/add-employee`           | Accounts     | Create a new employee account with credentials email |
| POST   | `/auth/forgot-password`        | Public       | Request password reset email                   |
| POST   | `/auth/reset-password/:token`  | Public       | Reset password using token from email          |

#### POST `/auth/login`

**Request Body:**

```json
{
  "email": "employee1@company.com",
  "password": "Password123",
  "role": "Employee"
}
```

**Response (200):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "_id": "...",
    "name": "Alice Employee One",
    "email": "employee1@company.com",
    "role": "Employee",
    "department": "Engineering",
    "employeeId": "EMP-101"
  }
}
```

#### POST `/auth/add-employee`

**Request Body:**

```json
{
  "name": "New Employee",
  "email": "new@company.com",
  "role": "Employee",
  "department": "Engineering",
  "employeeId": "EMP-200",
  "password": ""
}
```

> If `password` is empty, a secure random password is auto-generated and emailed to the user.

#### POST `/auth/forgot-password`

**Request Body:**

```json
{
  "email": "employee1@company.com",
  "portal": "Employee"
}
```

> The `portal` parameter is included in the reset email subject and body to indicate the requesting portal.

---

### Voucher Endpoints

| Method | Endpoint                              | Access              | Description                                  |
| ------ | ------------------------------------- | ------------------- | -------------------------------------------- |
| POST   | `/vouchers`                           | Employee            | Create a new draft voucher                   |
| GET    | `/vouchers/my`                        | Employee            | List my vouchers (with filters & pagination) |
| GET    | `/vouchers/pending`                   | Director            | List pending vouchers for review             |
| GET    | `/vouchers`                           | Director, Accounts  | List all vouchers (with filters & pagination)|
| GET    | `/vouchers/:id`                       | All authenticated   | Get a single voucher by ID                   |
| PUT    | `/vouchers/:id`                       | Employee            | Update a draft voucher                       |
| DELETE | `/vouchers/:id`                       | Employee            | Delete a draft voucher                       |
| POST   | `/vouchers/:id/signature`             | Employee            | Upload employee signature to a voucher       |
| PATCH  | `/vouchers/:id/submit`                | Employee            | Submit draft voucher for approval            |
| POST   | `/vouchers/:id/director-signature`    | Director            | Upload director signature to a voucher       |
| PATCH  | `/vouchers/:id/approve`               | Director            | Approve a pending voucher                    |
| PATCH  | `/vouchers/:id/reject`                | Director            | Reject a pending voucher with reason         |

#### POST `/vouchers` — Create Voucher

**Request Body:**

```json
{
  "expenseDate": "2026-07-15",
  "departmentName": "Engineering",
  "expenseTitle": "Cloud Server Cost",
  "expenseCategory": "Other",
  "expenseDescription": "Monthly AWS hosting bill",
  "amount": 850.50,
  "employeeIdCode": "EMP-101"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "voucherNumber": "VOU-2026-000006",
    "status": "Draft",
    "employeeSignatureUrl": "",
    "amount": 850.50,
    "..."
  }
}
```

#### Query Parameters for List Endpoints

All list endpoints (`GET /vouchers`, `/vouchers/my`, `/vouchers/pending`) support the following query parameters:

| Parameter       | Type   | Description                                     |
| --------------- | ------ | ----------------------------------------------- |
| `voucherNumber` | String | Partial match on voucher number                  |
| `employeeName`  | String | Partial match on employee name                   |
| `department`    | String | Partial match on department name                 |
| `expenseCategory` | String | Exact match (`Travel`, `Food`, etc.)          |
| `status`        | String | Exact match (`Draft`, `Approved`, etc.)          |
| `dateFrom`      | String | Start date for expense date range (YYYY-MM-DD)   |
| `dateTo`        | String | End date for expense date range (YYYY-MM-DD)     |
| `amountMin`     | Number | Minimum amount filter                            |
| `amountMax`     | Number | Maximum amount filter                            |
| `page`          | Number | Page number (default: 1)                         |
| `limit`         | Number | Results per page (default: 10)                   |
| `sortBy`        | String | Field to sort by (default: `createdAt`)          |
| `sortOrder`     | String | `asc` or `desc` (default: `desc`)                |

#### PATCH `/vouchers/:id/reject`

**Request Body:**

```json
{
  "rejectionReason": "Expense exceeds budget limit for this category."
}
```

---

### Dashboard Endpoints

| Method | Endpoint                  | Access    | Description                                      |
| ------ | ------------------------- | --------- | ------------------------------------------------ |
| GET    | `/dashboard/employee`     | Employee  | Personal voucher stats and amount summaries       |
| GET    | `/dashboard/director`     | Director  | Pending counts, today's activity, recent actions  |
| GET    | `/dashboard/accounts`     | Accounts  | Organization-wide stats and recent approved items |

#### GET `/dashboard/employee` — Response

```json
{
  "success": true,
  "data": {
    "Draft": 1,
    "PendingApproval": 1,
    "Approved": 0,
    "Rejected": 0,
    "Total": 2,
    "TotalApprovedAmount": 0,
    "TotalClaimedAmount": 900.50
  }
}
```

---

## Voucher Workflow

```mermaid
stateDiagram-v2
    [*] --> Draft : Employee creates voucher
    Draft --> Draft : Employee edits / uploads signature
    Draft --> PendingApproval : Employee submits (signature required)
    PendingApproval --> Approved : Director approves (signature required)
    PendingApproval --> Rejected : Director rejects (reason required)
    Draft --> [*] : Employee deletes draft
```

### Business Rules

1. **Employee Signature is Mandatory** — A voucher cannot be submitted for approval unless the employee has explicitly uploaded a signature to that specific voucher.
2. **Director Signature is Mandatory** — A voucher cannot be approved unless the director has provided a signature (either uploaded per-voucher or from their stored profile signature).
3. **Rejection Reason is Required** — A director must provide a written reason when rejecting a voucher.
4. **Drafts are Editable** — Only vouchers in `Draft` status can be edited or deleted.
5. **Auto-Generated Voucher Numbers** — Sequential format `VOU-YYYY-XXXXXX` using an atomic counter.

---

## Role-Based Access Control

| Feature                     | Employee | Director | Accounts |
| --------------------------- | :------: | :------: | :------: |
| Create / Edit / Delete Vouchers | ✅ | ❌ | ❌ |
| Upload Employee Signature   | ✅       | ❌       | ❌       |
| Submit Voucher for Approval | ✅       | ❌       | ❌       |
| View Own Vouchers           | ✅       | ❌       | ❌       |
| View All Vouchers           | ❌       | ✅       | ✅       |
| View Pending Vouchers       | ❌       | ✅       | ❌       |
| Approve / Reject Vouchers   | ❌       | ✅       | ❌       |
| Upload Director Signature   | ❌       | ✅       | ❌       |
| Add New Employees           | ❌       | ❌       | ✅       |
| View Employee Dashboard     | ✅       | ❌       | ❌       |
| View Director Dashboard     | ❌       | ✅       | ❌       |
| View Accounts Dashboard     | ❌       | ❌       | ✅       |

---

## Email Service

The system uses a **dual-dispatch email architecture**:

1. **Primary: Nodemailer (SMTP)** — Uses Gmail SMTP with App Passwords. No custom domain required. Emails can be sent to any address.
2. **Fallback: Resend API** — Activated only if SMTP credentials are not configured. Limited to verified sandbox recipients during development.

### Emails Sent

| Trigger                  | Subject                                           | Content                                       |
| ------------------------ | ------------------------------------------------- | --------------------------------------------- |
| New Employee Created     | `Your ExpenseVoucher Account Credentials`         | Login email, password, and portal URL         |
| Forgot Password          | `Reset your ExpenseVoucher Password [Portal Name]`| Reset link with 10-minute expiry              |

---

## Assumptions Made During Development

1. **Single Organization Scope** — The system assumes a single organization. There is no multi-tenancy. All users belong to the same company.

2. **Three Fixed Roles** — Only three roles exist: `Employee`, `Director`, and `Accounts`. There is no super-admin or dynamic role creation.

3. **Single Director** — The system assumes a single Director (or multiple Directors with equal authority) can approve or reject any submitted voucher. There is no hierarchical approval chain or department-specific director assignment.

4. **Voucher Numbers are Year-Scoped** — The auto-generated voucher number format `VOU-YYYY-XXXXXX` resets its counter per calendar year using the Counter collection.

5. **Employee Signature Per Voucher** — Each voucher requires its own explicitly uploaded employee signature. Profile signatures are NOT auto-copied to vouchers to ensure deliberate authorization of each expense claim.

6. **Signatures are Image Files** — Signatures are stored as uploaded image files (PNG/JPEG) on the local filesystem under `backend/uploads/signatures/`. In production, these should be migrated to cloud storage (e.g., AWS S3, Cloudinary).

7. **No Receipt/Invoice Attachments** — The current implementation handles signature uploads only. Supporting receipt/invoice file attachments (PDF, images) is a natural extension but is not currently implemented.

8. **Email Delivery in Development** — During development, password reset emails are hardcoded to be sent to `omkottalwar17@gmail.com` (the only verified Resend sandbox address). In production, this override should be removed so that emails go to the actual user's registered address.

9. **JWT-Based Stateless Auth** — Authentication uses stateless JWT tokens stored on the client side (localStorage). There is no server-side session store or token blacklist for logout. Logout is handled by discarding the token client-side.

10. **No Pagination on Dashboard** — Dashboard endpoints return aggregated statistics and the last 10 recent activity items. They do not support pagination for the activity feed.

11. **MongoDB Atlas** — The application assumes a cloud-hosted MongoDB Atlas cluster. Connection strings reference Atlas endpoints. Local MongoDB instances can be used by changing `MONGODB_URI`.

12. **No Payment Processing** — The system tracks expense amounts for approval but does not integrate with any payment gateway or reimbursement disbursement system.

13. **CORS Single Origin** — The backend CORS policy is configured for a single frontend origin (`CLIENT_URL`). In production, this should be updated to match the deployed frontend domain.

14. **Amount in Single Currency** — All amounts are treated as a single currency (₹ INR as displayed in the UI). There is no multi-currency support or conversion.

---

## Project Structure

```
ExpenseVoucherMangement/
├── backend/
│   ├── server.js                        # Entry point — starts Express + MongoDB
│   ├── seed.js                          # Database seeding script
│   ├── package.json                     # Backend dependencies
│   ├── .env                             # Environment variables (gitignored)
│   ├── .env.example                     # Environment template
│   ├── uploads/                         # Uploaded signature images
│   │   └── signatures/
│   └── src/
│       ├── app.js                       # Express app configuration (CORS, routes, middleware)
│       ├── config/
│       │   └── db.js                    # MongoDB connection
│       ├── controllers/
│       │   ├── authController.js        # Auth: login, register, forgot/reset password, add employee
│       │   ├── voucherController.js     # CRUD, submit, approve, reject, signature upload, query builder
│       │   └── dashboardController.js   # Dashboard aggregation stats per role
│       ├── middleware/
│       │   ├── authenticate.js          # JWT verification middleware
│       │   ├── authorize.js             # Role-based authorization middleware
│       │   ├── errorHandler.js          # Centralized error handler
│       │   ├── upload.js                # Multer file upload configuration
│       │   └── validate.js              # express-validator result handler
│       ├── models/
│       │   ├── User.js                  # User schema (with password hashing hooks)
│       │   ├── Voucher.js               # Voucher schema (full lifecycle fields)
│       │   └── Counter.js               # Auto-increment counter for voucher numbers
│       ├── routes/
│       │   ├── authRoutes.js            # Auth route definitions
│       │   ├── voucherRoutes.js         # Voucher route definitions
│       │   └── dashboardRoutes.js       # Dashboard route definitions
│       ├── services/
│       │   ├── emailService.js          # Dual email dispatch (SMTP + Resend)
│       │   └── voucherNumberService.js  # Sequential voucher number generator
│       └── validators/
│           ├── authValidator.js         # Input validation rules for auth
│           └── voucherValidator.js      # Input validation rules for vouchers
│
└── frontend/
    ├── package.json                     # Frontend dependencies
    ├── vite.config.js                   # Vite configuration
    ├── index.html                       # HTML entry point
    ├── .env                             # Frontend environment variables
    └── src/
        ├── App.jsx                      # Root component with routing
        ├── main.jsx                     # React DOM entry point
        ├── index.css                    # Global styles and CSS variables
        ├── api/
        │   └── apiClient.js             # Axios instance with interceptors
        ├── context/
        │   └── AuthContext.jsx          # Global auth state (user, token, signature)
        ├── components/
        │   ├── Navbar.jsx               # Navigation bar with role-based links
        │   ├── FilterBar.jsx            # Search & filter panel (date range, status, category)
        │   ├── ProtectedRoute.jsx       # Route guard for authenticated/role-specific access
        │   ├── SignaturePad.jsx          # Interactive signature draw/upload component
        │   └── StatusBadge.jsx          # Colored status indicator badges
        └── pages/
            ├── Login.jsx                # Gateway login portal selector
            ├── ForgotPassword.jsx       # Password reset request page
            ├── ResetPassword.jsx        # New password entry page (via token)
            ├── Unauthorized.jsx         # 403 error page
            ├── employee/
            │   ├── EmployeeLogin.jsx    # Employee-specific login form
            │   ├── EmployeeDashboard.jsx# Stats cards and quick actions
            │   ├── CreateVoucher.jsx    # New voucher form + signature pad
            │   ├── EditVoucher.jsx      # Edit draft voucher form
            │   ├── MyVouchers.jsx       # Voucher list with actions
            │   └── VoucherDetails.jsx   # Single voucher detail view
            ├── director/
            │   ├── DirectorLogin.jsx    # Director-specific login form
            │   ├── DirectorDashboard.jsx# Pending stats and activity feed
            │   ├── PendingVouchers.jsx  # Queue of vouchers awaiting review
            │   ├── AllVouchers.jsx      # Browse all company vouchers
            │   └── VoucherDetailsApproval.jsx # Review, sign, approve/reject
            └── accounts/
                ├── AccountsLogin.jsx    # Accounts-specific login form
                ├── AccountsDashboard.jsx# Organization-wide stats
                ├── AccountsAllVouchers.jsx # Browse all vouchers
                ├── AccountsVoucherDetails.jsx # Read-only voucher view
                └── AddEmployee.jsx      # New employee registration form
```

---

## Seeded Test Credentials

After running `npm run seed`, the following accounts are available:

| Role      | Name                 | Email                    | Password      | Employee ID |
| --------- | -------------------- | ------------------------ | ------------- | ----------- |
| Director  | Jane Director        | director@company.com     | Password123   | EMP-001     |
| Accounts  | Bob Accountant       | accounts@company.com     | Password123   | EMP-002     |
| Employee  | Alice Employee One   | employee1@company.com    | Password123   | EMP-101     |
| Employee  | Charlie Employee Two | employee2@company.com    | Password123   | EMP-102     |
| Employee  | David Employee Three | employee3@company.com    | Password123   | EMP-103     |

The seed also creates 5 sample vouchers in various states (Draft, PendingApproval, Approved, Rejected) and initializes the voucher counter.
