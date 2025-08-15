# Amrutam Ayurveda Consultation – Full Stack MVP

A full-stack appointment booking platform for discovering Ayurvedic doctors, booking consultations, and managing appointments with slot locking and rescheduling.

## Live Demo

- **Frontend** (Next.js): [amrutam-ayurveda-consult.vercel.app](https://amrutam-ayurveda-consult.vercel.app/)
- **Backend** (Node.js + Express): [amrutam-ayurveda-backend.vercel.app](https://amrutam-ayurveda-backend.vercel.app/)

---

## Features

### Patient Flows
- **Doctor Discovery** – Search/filter by specialization & mode (online/in-person)
- **Slot Booking** – Lock slot for 5 min using Redis, OTP confirmation
- **Appointment Management** – Reschedule/Cancel (>24h rule)
- **Dashboard** – View upcoming & past appointments

### (Bonus)
- Doctor/Admin routes (calendar & slot management)
- API documentation via Swagger (if implemented)

---

## Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TailwindCSS

**Backend**
- Node.js + Express + TypeScript
- Prisma ORM (PostgreSQL)
- Redis (slot locking, otp)
- JWT authentication

**Deployment**
- Vercel


