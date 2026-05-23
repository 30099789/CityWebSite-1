# CityLink Smart Community Portal

A full-stack web portal for a fictional local government agency, CityLink Initiatives. Built with React, Node.js, Express and MongoDB as part of the AT2 Capstone Project for ICT50220 Diploma of Information Technology.

## Team

- Kate Odabas
- Caio

## Live Demo

- Frontend: https://city-web-site.vercel.app
- Backend API: https://citywebsite-bvxz.onrender.com

## Tech Stack

- Frontend: React + Vite + Tailwind CSS + React Router
- Backend: Node.js + Express.js
- Database: MongoDB + Mongoose (MongoDB Atlas in production)
- Auth: JWT (jsonwebtoken) + bcryptjs
- File Upload: Multer
- XML Parsing: fast-xml-parser
- AI Chatbot: Google Gemini API (gemini-2.5-flash)
- Deployed: Vercel (frontend) + Render (backend)

## Requirements

- Node.js v18+
- MongoDB v6+ (local or Atlas)
- npm v9+

## Local Setup

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
GEMINI_API_KEY=your_gemini_api_key_here
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

XML files in `client/public/xml/` control configurable content:

| File | Purpose |
|------|---------|
| menu.xml | Navigation links |
| faq.xml | FAQ questions and answers |
| announcements.xml | Fallback announcement data |
| settings.xml | Site name, contact info, feature flags, alert banner |

Edit these files directly — changes show on next page load, no code changes needed.

## Security Features

- JWT authentication on all admin write routes
- bcryptjs password hashing
- XSS sanitisation middleware (sanitize.js)
- Role-based access control (admin, staff, resident)
- File upload validation (images only, max 5MB)
- Client-side XSS detection on feedback form
- Environment variables for all secrets (.env excluded from GitHub)

## Project Structure

```
CityWebSite/
  server/          
  client/          
  README.md
```

## Deployment

- Frontend deployed to Vercel — connected to GitHub Kate branch, auto-deploys on push
- Backend deployed to Render — Node.js web service, root directory: server
- Database hosted on MongoDB Atlas — free M0 cluster