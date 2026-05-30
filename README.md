# CityLink Smart Community Portal

A full-stack web portal for a fictional local government agency, CityLink Initiatives. Built with React, Node.js, Express and MongoDB as part of the AT2 Capstone Project for ICT50120 Diploma of Information Technology.

## Team

- Kate 
- Caio

## Live Demo

- Frontend: https://city-web-site.vercel.app
- Backend API: https://citywebsite-bvxz.onrender.com

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| File Upload | Multer + Base64 (stored in MongoDB) |
| XML Parsing | fast-xml-parser (server), DOMParser (browser) |
| AI Chatbot | Google Gemini API (gemini-2.5-flash) |
| Testing | Jest + Supertest (backend), Vitest (frontend) |
| Hosting | Vercel (frontend), Render (backend) |

---

## Requirements

- Node.js v18+
- MongoDB v6+ (local or Atlas)
- npm v9+

---

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
GEMINI_API_KEY=add_gemini_api_key_here
```

Seed the database with sample data:

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

---

## Login Credentials (Demo)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@citylink.gov | admin123 |
| Staff | staff@citylink.gov | staff123 |
| Resident | alice@email.com | alice123 |

---

## Features

- **Events** -- Browse and book community events. Duplicate booking prevention.
- **Announcements** -- XML and database merged content with priority levels (Alert, Update, Notice)
- **Services** -- Council services with contact details and service request form
- **Feedback** -- Star rating feedback form with category selection
- **FAQ** -- XML-importable FAQ with live search and category filter
- **AI Chatbot** -- Google Gemini powered assistant with live database context
- **Accessibility Widget** -- WCAG 2.1 AA compliant toolbar (font size, contrast, dyslexia font, keyboard nav)
- **Admin Portal** -- Full CRUD for all collections via a secure admin dashboard
- **XML Manager** -- Export all data as XML and import faq.xml or CityLink export files

---

## Admin Dashboard

Available at `/admin` after logging in as admin or staff:

| Page | Description |
|------|-------------|
| Manage Events | Create, edit, delete events and change status |
| Manage Announcements | Create, publish and unpublish announcements |
| Manage Services | Add and manage council services |
| Manage Feedback | View and respond to community feedback |
| Manage Bookings | View all event bookings |
| Manage Service Requests | View and update service request status |
| Manage Users | View and manage user accounts (admin only) |
| XML Manager | Import and export XML content |

---

## XML Configuration

XML files in `client/public/xml/` control configurable content without code changes:

| File | Purpose |
|------|---------|
| `announcements.xml` | Fallback announcement data merged with database |
| `faq.xml` | FAQ questions -- upload via XML Manager to save to database |
| `menu.xml` | Navigation links |
| `settings.xml` | Site name, contact info, feature flags, alert banner |

### How to update FAQ content without code changes

1. Edit `faq.xml` with your updated questions and answers
2. Log in as admin and go to XML Manager
3. Click Choose XML File and upload `faq.xml`
4. Confirm import -- questions are saved to MongoDB
5. The FAQ page will show the updated content immediately

---

## Security Features

- JWT authentication on all admin write routes
- bcryptjs password hashing (salt rounds: 10)
- XSS sanitisation middleware (`sanitize.js`) on all request bodies
- Role-based access control (admin, staff, resident)
- File upload validation (images only, 2MB limit)
- Base64 image storage in MongoDB (no disk exposure)
- Environment variables for all secrets (.env excluded from GitHub)

---

## Testing

The project includes 71 automated tests across backend and frontend.

### Run backend tests (Jest)

```bash
cd server
npm test
```

Tests: 41 passing across 3 suites

- `auth.test.js` -- bcrypt hashing, JWT verification, registration and login validation
- `bookings.test.js` -- duplicate booking prevention, missing field validation
- `feedback.test.js` -- rating range (1-5), required fields, anonymous submissions

### Run frontend tests (Vitest)

```bash
cd client
npm test
```

Tests: 30 passing across 2 suites

- `faq.test.jsx` -- FAQ normalise function, category filtering, keyword search
- `xmlService.test.js` -- XML sanitiser functions for announcements, events, services and FAQs

---

## Project Structure

```
CityWebSite/
  client/                    # React/Vite frontend
    src/
      pages/                 # Public pages (Home, Events, FAQ, Announcements, etc.)
      pages/admin/           # Admin portal pages
      services/              # API service functions
      context/               # AuthContext (JWT and role management)
      components/            # Shared components (Chatbot, Navbar, Accessibility Widget)
    public/
      xml/                   # XML configuration files
  server/                    # Node.js/Express backend
    models/                  # Mongoose models (Event, User, Booking, Faq, etc.)
    routes/                  # Express route handlers
    middleware/              # JWT auth, XSS sanitise
    __tests__/               # Jest unit tests
    server.js                # Entry point
  README.md
```

---

## Deployment

| Service | Platform | Config |
|---------|----------|--------|
| Frontend | Vercel | Connected to GitHub -- auto-deploys on push to main |
| Backend | Render | Node.js web service -- root directory: server |
| Database | MongoDB Atlas | Free M0 cluster -- IP whitelist: 0.0.0.0/0 for Render |

### Deployment notes

- Render free tier spins down after 15 minutes idle -- first request may take 30 seconds to wake
- Images are stored as Base64 in MongoDB so they persist across Render redeploys
- All environment variables (MONGO_URI, JWT_SECRET, GEMINI_API_KEY) must be set in Render dashboard

---

