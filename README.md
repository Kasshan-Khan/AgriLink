# 🌾 AgriLink — Agri Collection & Credit Platform

A full-stack MERN application for agricultural supply chain management, connecting farmers with collection centers and providing credit tracking.

## Features
- Public website with government schemes, collection center map, and info
- JWT-based authentication with role-based access (Admin, Manager, Farmer)
- Farmer dashboard with credit tracking and transaction history
- Manager dashboard for produce entry and daily records
- Admin dashboard with analytics, center management, and user oversight
- Cloudinary-powered image uploads for produce
- Interactive map with GPS-based center locator

## Tech Stack
- **Frontend**: React + Vite + TailwindCSS + Recharts + React Leaflet
- **Backend**: Node.js + Express.js + MongoDB + Mongoose
- **Image Storage**: Cloudinary
- **Auth**: JWT + bcryptjs

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (optional, for image uploads)

### Setup

1. **Clone & install server dependencies:**
```bash
cd server
npm install
```

2. **Configure server environment** — edit `server/.env`:
```
MONGO_URI=mongodb://localhost:27017/agrilink
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. **Seed demo data:**
```bash
cd server
node utils/seedData.js
```

4. **Install client dependencies:**
```bash
cd client
npm install
```

5. **Start both servers:**
```bash
# Terminal 1 — Backend (port 5000)
cd server && npm run dev

# Terminal 2 — Frontend (port 5173)
cd client && npm run dev
```

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@agrilink.com | admin123 |
| Manager | manager1@agrilink.com | manager123 |
| Farmer | farmer1@agrilink.com | farmer123 |
