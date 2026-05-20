# CityLink Smart Community Portal

A full-stack web portal for a fictional local government agency, CityLink Initiatives. Built with React, Node.js, Express and MongoDB.

## Tech Stack

- Frontend: React + Vite + Tailwind CSS + React Router
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose
- Auth: JWT (jsonwebtoken) + bcryptjs
- File Upload: Multer
- XML Parsing: fast-xml-parser

## Requirements

- Node.js v18+
- MongoDB v6+ (local or Atlas)
- npm v9+

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/Kate-P288004/CityWebSite.git 
cd CityWebSite
```

### 2. Backend setup

```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder:

```
MONGO_URI=mongodb://localhost:27017/citylink
JWT_SECRET=citylink_jwt_secret_2026
PORT=5000
```

Seed the database:

```bash
node seed.js
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

Open your browser at http://localhost:5173

## Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@citylink.gov | admin123 |
| Staff | staff@citylink.gov | staff123 |
| Resident | alice@email.com | alice123 |

## Admin Dashboard

Available at /admin after logging in as admin or staff:

- Manage Events — create, edit, delete events and change status
- Manage Announcements — create, publish, unpublish announcements
- Manage Services — add and manage council services
- Manage Feedback — view and respond to community feedback
- Manage Bookings — view event bookings
- Manage Users — view and manage user accounts (admin only)
- XML Manager — import/export XML content

## XML Configuration

XML files in client/public/xml/ control configurable content:

| File | Purpose |
|------|---------|
| menu.xml | Navigation links |
| faq.xml | FAQ questions and answers |
| announcements.xml | Fallback announcement data |
| settings.xml | Site name, contact info, feature flags, alert banner |

Edit these files directly — changes show on next page load, no code changes needed.


