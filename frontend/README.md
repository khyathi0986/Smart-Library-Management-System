# Smart Library Frontend

A React + Vite UI prototype for the Smart Library Management System. It provides a VTOP-inspired role selection and sign-in screen, then a role-specific dashboard for Student, Faculty, or Librarian.

## Requirements
- Node.js 20+ recommended
- Spring Boot User Service running on `http://localhost:8081` for real registration/login

## Run locally
From this folder:
```bash
npm install
npm run dev
```
Open the local URL printed by Vite (usually `http://localhost:5173`).

## User Service API integration
The UI calls:
- `POST http://localhost:8081/api/users/login`
- `POST http://localhost:8081/api/users/register`
- `GET http://localhost:8081/api/users/profile`

Expected login response includes a JWT in `token` (or `accessToken` / `jwt`) and ideally user fields (`name`, `email`, `role`). The code supports `data.user` or fields at the top level. If your DTO uses a different shape, adjust `submitAuth()` in `src/main.jsx`.

Registration payload: `{ "name": "...", "email": "...", "password": "...", "role": "STUDENT" }`.

**Important:** Your current backend intentionally blocks public Librarian registration with HTTP 403. The UI disables that registration option and displays a notice. Librarian login works if an administrator-created account exists.

## What's connected vs. prototype
- Connected: User Service login, registration, and profile refresh.
- UI placeholders: catalogue search, book management, borrowing/returns, reports, AI recommendations, feedback, insights, and notifications. These require Book, Library, and Smart services to be implemented and connected.
- The UI does not invent or save demo book records. The dashboard clearly indicates where future service data will appear.

## CORS
If the browser reports a CORS error, configure your Spring Boot User Service to allow the Vite development origin `http://localhost:5173` for `/api/users/**`. Do not disable CORS globally. If Vite uses another port, allow the actual origin.

## Notes
This is a frontend starter, not a production-ready authentication system. For production, use HTTPS, secure token handling, CSRF/session decisions appropriate to your architecture, and server-side role authorization on every protected operation.
