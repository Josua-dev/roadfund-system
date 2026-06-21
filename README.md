# RoadSafe Namibia
### Road Maintenance Reporting & Tracking System — operated by the Road Fund Administration (RFA)

A full-stack, production-grade government web platform built with **React + Vite + TypeScript** on the frontend and **Node.js + Express + MySQL** on the backend.

---

## Tech Stack

| Layer       | Technology |
|-------------|------------|
| Frontend    | React 18, Vite, TypeScript, Tailwind CSS |
| State       | React Query (TanStack), React Context |
| UI/UX       | Framer Motion, Lucide Icons, Recharts |
| Map         | Leaflet.js + React-Leaflet |
| Backend     | Node.js, Express.js, REST API |
| Database    | MySQL (via XAMPP), mysql2 |
| Auth        | JWT, bcryptjs |
| Upload      | Multer |
| Dev Tools   | Nodemon, Vite HMR |

---

## Quick Setup (XAMPP + VS Code)

### Prerequisites
- XAMPP installed (https://www.apachefriends.org/)
- Node.js 18+ installed (https://nodejs.org/)
- VS Code installed

---

### Step 1 — Start XAMPP MySQL

1. Open **XAMPP Control Panel**
2. Start **Apache** (for phpMyAdmin)
3. Start **MySQL**
4. Confirm MySQL is running on port **3306**

---

### Step 2 — Create the Database

**Option A — phpMyAdmin (Recommended)**
1. Open http://localhost/phpmyadmin in your browser
2. Click **"New"** in the left panel
3. Database name: `roadfund_system`
4. Collation: `utf8mb4_unicode_ci`
5. Click **Create**
6. Click the **Import** tab
7. Choose file → `database/schema.sql` → Click **Go**
8. Repeat Import for `database/seed.sql`

**Option B — MySQL CLI**
```bash
# Open terminal inside XAMPP's mysql/bin directory
mysql -u root -p
```
```sql
source /path/to/roadfund/database/schema.sql;
source /path/to/roadfund/database/seed.sql;
```

---

### Step 3 — Backend Setup

```bash
# Open the backend folder in VS Code terminal
cd backend

# Install all dependencies
npm install

# The .env file is already configured for XAMPP defaults:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=
# DB_PORT=3306

# Start the development server
npm run dev
```

You should see:
```
Road Fund API running on http://localhost:5000
MySQL connected successfully via XAMPP
```

---

### Step 4 — Frontend Setup

```bash
# Open a NEW terminal tab
cd frontend

# Install all dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

### Step 5 — Open the App

Navigate to **http://localhost:5173** in your browser.

---

## Demo Login Credentials

All accounts use password: **`Password123!`**

| Role                | Email                    | Access |
|---------------------|--------------------------|--------|
| **Administrator**   | admin@roadfund.na        | Full system access |
| **Inspector**       | inspector@roadfund.na    | Verify & review reports |
| **Maint. Officer**  | officer@roadfund.na      | Update repair progress |
| **Citizen**         | citizen@roadfund.na      | Submit & track reports |

> The login page has **Quick Demo Access** buttons for one-click login.

---

## Project Structure

```
roadfund/
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js    # Login, register, profile
│   │   ├── reportsController.js # CRUD + map data
│   │   ├── maintenanceController.js
│   │   ├── analyticsController.js
│   │   ├── usersController.js
│   │   └── notificationsController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT + role guards
│   │   └── upload.js            # Multer file handler
│   ├── routes/
│   │   ├── auth.js
│   │   ├── reports.js
│   │   ├── maintenance.js
│   │   ├── users.js
│   │   ├── analytics.js
│   │   ├── notifications.js
│   │   └── regions.js
│   ├── uploads/                 # Uploaded images stored here
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/index.tsx # Badge, StatCard, Table, Modal, etc.
│   │   │   └── layout/
│   │   │       ├── PublicLayout.tsx
│   │   │       └── DashboardLayout.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── ReportDetail.tsx
│   │   │   ├── MapView.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── NotificationsPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   ├── citizen/
│   │   │   │   ├── CitizenDashboard.tsx
│   │   │   │   ├── SubmitReport.tsx
│   │   │   │   └── MyReports.tsx
│   │   │   ├── inspector/
│   │   │   │   └── InspectorDashboard.tsx
│   │   │   ├── maintenance/
│   │   │   │   └── MaintenanceDashboard.tsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.tsx
│   │   │       ├── AdminReports.tsx
│   │   │       └── AdminUsers.tsx
│   │   ├── types/index.ts
│   │   ├── utils/
│   │   │   ├── api.ts           # Axios instance
│   │   │   └── helpers.ts       # Formatters, badge configs
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
└── database/
    ├── schema.sql               # All CREATE TABLE statements
    └── seed.sql                 # Sample data
```

---

## Database Tables

| Table               | Purpose |
|---------------------|---------|
| `users`             | All user accounts with roles |
| `regions`           | 14 Namibian regions |
| `reports`           | Road issue reports |
| `maintenance_tasks` | Repair assignments |
| `attachments`       | Uploaded images per report |
| `status_history`    | Full audit trail of status changes |
| `notifications`     | Per-user notification inbox |
| `inspection_reports`| Inspector findings |
| `audit_logs`        | System-wide action logging |

---

## REST API Endpoints

### Auth
| Method | Endpoint             | Description |
|--------|----------------------|-------------|
| POST   | /api/auth/register   | Create citizen account |
| POST   | /api/auth/login      | JWT login |
| GET    | /api/auth/profile    | Get own profile |
| PUT    | /api/auth/profile    | Update profile |
| PUT    | /api/auth/change-password | Change password |

### Reports
| Method | Endpoint                | Description |
|--------|-------------------------|-------------|
| GET    | /api/reports            | List reports (with filters) |
| GET    | /api/reports/map        | Map markers data |
| GET    | /api/reports/:id        | Full report detail |
| POST   | /api/reports            | Submit new report |
| PATCH  | /api/reports/:id/status | Update status (staff) |
| DELETE | /api/reports/:id        | Delete report |

### Maintenance
| Method | Endpoint             | Description |
|--------|----------------------|-------------|
| GET    | /api/maintenance     | List tasks |
| GET    | /api/maintenance/:id | Task detail |
| POST   | /api/maintenance     | Create task (admin) |
| PATCH  | /api/maintenance/:id | Update progress |

### Analytics
| Method | Endpoint                        | |
|--------|---------------------------------|-|
| GET    | /api/analytics/overview         | Admin stats |
| GET    | /api/analytics/by-region        | Per region |
| GET    | /api/analytics/monthly-trend    | 12 months |
| GET    | /api/analytics/by-severity      | Severity split |
| GET    | /api/analytics/by-status        | Status split |
| GET    | /api/analytics/by-issue-type    | Type split |
| GET    | /api/analytics/citizen-stats    | Personal stats |

---

## User Roles & Permissions

| Feature                    | Citizen | Inspector | Officer | Admin |
|----------------------------|:-------:|:---------:|:-------:|:-----:|
| Submit report              | Yes     | Yes        | Yes     | Yes    |
| View own reports           | Yes     | Yes        | Yes     | Yes    |
| View all reports           | No      | Yes        | Yes     | Yes    |
| Change report status       | No      | Yes        | Yes     | Yes    |
| View analytics             | No      | Yes        | Yes     | Yes    |
| Manage maintenance tasks   | No      | No        | Yes     | Yes    |
| Create maintenance tasks   | No      | No        | No      | Yes    |
| Manage users               | No      | No        | No      | Yes    |

---

## Troubleshooting

**MySQL connection failed**
- Make sure XAMPP MySQL is running (green in XAMPP panel)
- Check `backend/.env` — password should be empty for default XAMPP root
- Confirm database `roadfund_system` exists in phpMyAdmin

**Port 5000 already in use**
- Change `PORT=5001` in `backend/.env`
- Update `vite.config.ts` proxy target to match

**npm install fails**
- Use Node.js 18+: `node -v`
- Delete `node_modules` and `package-lock.json`, then retry

**Map not loading**
- The Leaflet CSS is loaded via CDN in `index.html`
- Ensure internet connection for tile loading

---

## Running Both Servers

Keep **two terminal tabs** open in VS Code:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend  
cd frontend && npm run dev
```

---

*Built for Road Fund Administration Namibia · Government Infrastructure Division*
