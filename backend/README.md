# FITCORE Gym Management - Backend API

Robust, scalable Node.js + Express + TypeScript REST API backend for the FITCORE Gym Management SaaS platform.

## Architecture

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM (plus resilient fallback local storage engine)
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **CORS**: Environment-isolated with `CLIENT_URL`

## API Endpoints

All backend endpoints are prefixed with `/api`:

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new gym organization & owner
- `POST /api/auth/login` - Authenticate user and receive JWT token
- `POST /api/auth/logout` - Clear user session
- `POST /api/auth/refresh` - Refresh active JWT token
- `GET /api/auth/me` - Fetch profile of currently authenticated user
- `POST /api/auth/change-password` - Update current user password
- `POST /api/auth/forgot-password` - Request password reset token
- `POST /api/auth/reset-password` - Reset password using verified token

### Members (`/api/members`)
- `GET /api/members` - List gym members (with search & filters)
- `GET /api/members/:id` - Get member dossier by ID
- `POST /api/members` - Create new member
- `PUT /api/members/:id` - Update member details
- `DELETE /api/members/:id` - Archive/remove member
- `POST /api/members/:id/freeze` - Freeze membership
- `POST /api/members/:id/renew` - Renew membership plan

### Membership Plans (`/api/plans` & `/api/memberships`)
- `GET /api/plans` - List active membership plans
- `POST /api/plans` - Create membership plan
- `PUT /api/plans/:id` - Update membership plan
- `DELETE /api/plans/:id` - Deactivate/delete plan

### Turnstile & Attendance (`/api/attendance`)
- `GET /api/attendance` - List daily check-in/out records and analytics
- `POST /api/attendance/check-in` - QR or manual check-in
- `POST /api/attendance/:id/check-out` - Mark checkout

### Classes & Scheduling (`/api/classes`)
- `GET /api/classes` - List scheduled classes
- `POST /api/classes` - Schedule class session
- `PUT /api/classes/:id` - Update class details
- `DELETE /api/classes/:id` - Cancel class session
- `POST /api/classes/:id/enroll` - Enroll or waitlist member
- `POST /api/classes/:id/cancel` - Cancel booking
- `POST /api/classes/:id/toggle-checkin` - Toggle attendance for attendee

### Trainers (`/api/trainers`)
- `GET /api/trainers` - List trainers
- `POST /api/trainers` - Add trainer
- `PUT /api/trainers/:id` - Update trainer profile
- `DELETE /api/trainers/:id` - Remove trainer

### Financials & Invoices (`/api/payments` & `/api/expenses`)
- `GET /api/payments` - List payment receipts
- `POST /api/payments` - Record member payment
- `GET /api/payments/invoice/:invoiceNumber` - Retrieve formatted tax invoice
- `GET /api/expenses` - List facility expenses
- `POST /api/expenses` - Log operational expense
- `DELETE /api/expenses/:id` - Delete expense record

### Workouts (`/api/workouts`)
- `GET /api/workouts` - List workout routines
- `POST /api/workouts` - Assign workout routine

### Dashboard & Telemetry (`/api/dashboard` & `/api/reports`)
- `GET /api/dashboard/overview` - Executive statistics, revenue charts, and presence metrics
- `GET /api/reports` - Consolidated facility performance report

### Notifications (`/api/notifications`)
- `GET /api/notifications` - List notifications
- `POST /api/notifications/:id/read` - Mark notification as read
- `POST /api/notifications/read-all` - Mark all notifications as read

## Environment Variables

Create `.env` in the `backend/` directory (or copy from `.env.example`):

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/fitcore
JWT_SECRET=replace_with_a_secure_secret
CLIENT_URL=http://localhost:5173
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Database
```bash
npm run seed
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm run start
```
Compiled JavaScript files are generated into `dist/`.
