# FITCORE - Enterprise Gym Management SaaS

FITCORE is a full-stack gym management SaaS platform designed for high-performance athletic facilities, boutique fitness studios, and enterprise gym chains.

The project is architected as two decoupled, independently runnable applications:
1. **`frontend/`**: React 19 + TypeScript + Vite + Tailwind CSS single page application.
2. **`backend/`**: Node.js + Express + TypeScript + MongoDB (with fallback storage engine) REST API.

---

## 📁 Project Structure

```
FITCORE/
│
├── frontend/                        # Frontend Web Application
│   ├── public/                      # Static assets & icons
│   ├── src/
│   │   ├── components/              # UI components (Header, Sidebar, Modals, Drawer)
│   │   ├── pages/                   # Application pages (Dashboard, Members, Classes, Billing, etc.)
│   │   ├── layouts/                 # Page layout shells
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── services/                # API client (api.ts)
│   │   ├── utils/                   # Formatting & calculation utilities
│   │   ├── types/                   # TypeScript interfaces & types
│   │   ├── store/                   # State management
│   │   ├── routes/                  # Navigation & route definitions
│   │   ├── context/                 # AuthContext & Session management
│   │   ├── App.tsx                  # Root application component
│   │   └── main.tsx                 # React entry point
│   ├── .env                         # Frontend local environment variables
│   ├── .env.example                 # Frontend template environment
│   ├── index.html                   # HTML entry point
│   ├── package.json                 # Frontend dependencies & scripts
│   ├── tsconfig.json                # Frontend TypeScript config
│   ├── vite.config.ts               # Vite configuration
│   └── README.md                    # Frontend documentation
│
├── backend/                         # Backend REST API
│   ├── src/
│   │   ├── config/                  # Database connection & env configurations
│   │   ├── controllers/             # Express route controllers
│   │   ├── middleware/              # Auth & error handling middlewares
│   │   ├── models/                  # Mongoose schemas & fallback storage
│   │   ├── routes/                  # Modular API endpoints (/api/*)
│   │   ├── services/                # Business logic services
│   │   ├── validators/              # Payload validation rules
│   │   ├── utils/                   # Utilities & database seeder (seed.ts)
│   │   ├── types/                   # Backend TypeScript interfaces
│   │   ├── uploads/                 # Uploaded media storage
│   │   ├── app.ts                   # Express application setup
│   │   └── server.ts                # Server entry point
│   ├── .env                         # Backend local environment variables
│   ├── .env.example                 # Backend template environment
│   ├── package.json                 # Backend dependencies & scripts
│   ├── tsconfig.json                # Backend TypeScript config
│   └── README.md                    # Backend documentation
│
├── .gitignore                       # Root git ignore rules
├── docker-compose.yml               # Multi-container orchestration (MongoDB + Backend + Frontend)
└── README.md                        # Project root documentation
```

---

## ⚡ Quick Start

### 1. Prerequisites
- Node.js 18+ or 20+
- npm (or yarn / pnpm)
- MongoDB (optional - local embedded fallback storage works immediately out-of-the-box)

---

### 2. Backend Setup & Run

Navigate to the `backend/` directory:

```bash
cd backend
npm install
```

#### Environment Variables (`backend/.env`):
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/fitcore
JWT_SECRET=fitcore_production_super_secret_jwt_key_2025
CLIENT_URL=http://localhost:5173
```

#### Seed Demo Data:
```bash
npm run seed
```

#### Start Backend in Development Mode:
```bash
npm run dev
```
The backend will be live at `http://localhost:3000`. Health check: `http://localhost:3000/api/health`.

---

### 3. Frontend Setup & Run

In a new terminal, navigate to the `frontend/` directory:

```bash
cd frontend
npm install
```

#### Environment Variables (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000/api
```

#### Start Frontend in Development Mode:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 🔑 Demo Login Credentials

You can sign in with any of the following pre-seeded test accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Owner** | `owner@fitcore.com` | `password123` | Full administrative control, billing, settings |
| **Admin** | `admin@fitcore.com` | `password123` | Management, members, attendance, classes |
| **Receptionist** | `reception@fitcore.com` | `password123` | Front-desk check-in, members, renewals |
| **Trainer** | `trainer@fitcore.com` | `password123` | Trainer portal, coaching agenda, workouts |
| **Member** | `member@fitcore.com` | `password123` | Member passport, QR pass, class enrollment |

---

## 📦 Production Builds

### Build Frontend:
```bash
cd frontend
npm run build
```
Generates production bundle in `frontend/dist/`.

### Build Backend:
```bash
cd backend
npm run build
npm run start
```
Compiles TypeScript into `backend/dist/` and runs the production server.

---

## 🐳 Docker Deployment

To run MongoDB, Backend, and Frontend together with Docker Compose:

```bash
docker-compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- MongoDB: `mongodb://localhost:27017`
