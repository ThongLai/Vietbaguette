# Backend

Node.js + Express + Prisma + Socket.IO backend for Viet Baguette.

## Features
- REST API for menu, orders, users, schedules, notifications
- Real-time updates via Socket.IO
- PostgreSQL database (via Prisma ORM)
- JWT authentication, role-based access

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up the `.env` file (see `.env.example`)
3. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```
4. Start the server:
   ```bash
   npm run dev
   ``` 