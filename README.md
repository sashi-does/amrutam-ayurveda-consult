# Amrutam Ayurveda Consultation – Full Stack MVP

A full-stack appointment booking platform for discovering Ayurvedic doctors, booking consultations, and managing appointments with slot locking and rescheduling.

## Live Demo
- **Frontend** (Next.js): [amrutam-ayurveda-consult.vercel.app](https://amrutam-ayurveda-consult.vercel.app/)
- **Backend** (Node.js + Express): [amrutam-ayurveda-backend.vercel.app](https://amrutam-ayurveda-backend.vercel.app/)



## Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TailwindCSS
- TypeScript

**Backend**
- Node.js + Express + TypeScript
- Prisma ORM (PostgreSQL)
- Redis (slot locking, OTP storage)
- JWT authentication

**Deployment**
- Vercel (Frontend & Backend)

---

## Local Setup Guide

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Git

### Clone Repository
```bash
git clone [<repository-url>](https://github.com/sashi-does/amrutam-ayurveda-consult.git)
```

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install --peer-legacy-deps
```

### 3. Environment Configuration
Create a `.env` file in the backend directory:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Email (for OTP)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Server
PORT=3000
NODE_ENV="development"
```

### 4. Database Setup & Start Server
```bash
cd src && npx prisma generate && npx prisma migrate dev
npm run dev
```

The backend will run on `http://localhost:3000`

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install --peer-legacy-deps
```

### 3. Environment Configuration
Create a `.env.local` file in the frontend directory:
```env
# API Base URL
NEXT_PUBLIC_API_URL="http://localhost:3000/api/v1"

# Other environment variables if needed
NEXT_PUBLIC_APP_NAME="Amrutam Ayurveda"
```

### 4. Start Frontend Development Server
```bash
npm run dev
```

The frontend will run on `http://localhost:3001`
