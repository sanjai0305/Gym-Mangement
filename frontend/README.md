# FITCORE Gym Management - Frontend Application

Modern, high-performance web interface for the FITCORE Gym Management SaaS platform. Built with React 19, Vite, Tailwind CSS, TypeScript, and Lucide React.

## Features

- **Dashboard**: High-altitude operational overview, revenue tracking, attendance metrics, and quick actions.
- **Member Directory**: Comprehensive dossier management, status filtering, biometric telemetry, and drawer actions.
- **Turnstile & Attendance**: Optical QR code badge scanner, manual check-in/out, and live turnstile logs.
- **Class Schedules**: Timetable management, booking & waitlist handling, coach allocations, and check-ins.
- **Billing & Invoices**: Itemized commercial invoices, tax receipts, and payment record tracking.
- **Workout Builder**: Custom routines, sets/reps/tempo progression schemes, and member assignments.
- **Member Portal**: Self-service member passport, digital QR pass, schedule browser, and invoice downloads.
- **Trainer Portal**: Dedicated coach agenda, athlete roster, and attendance tracking.
- **Facility Settings**: Operating hours, tax percentage, branding, and pricing tier configurations.

## Tech Stack

- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS (v4)**
- **Lucide React**
- **Recharts**
- **TanStack Query / Axios**
- **React Hook Form / Zod**

## Environment Variables

Create `.env` in the `frontend/` directory (or copy from `.env.example`):

```env
VITE_API_URL=http://localhost:3000/api
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

### 3. Production Build
```bash
npm run build
npm run preview
```
Output bundle is placed in `dist/`.
