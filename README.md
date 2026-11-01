# Tails of Bijapur

A small web app for Tails of Bijapur — a rescue/rehabilitation project. This repository contains a Vite + React frontend and a minimal Express backend that handles contact, volunteer and incident reporting (including email sending). The frontend serves static assets (images/videos) and uses Tailwind CSS for styling.

This README explains how to run the project locally, environment variables, common troubleshooting, and development tips.

---

## Table of contents

- [Tech stack](#tech-stack)  
- [Prerequisites (Windows)](#prerequisites-windows)  
- [Get the code](#get-the-code)  
- [Environment variables](#environment-variables)  
- [Install & run (development)](#install--run-development)  
- [Build & serve (production)](#build--serve-production)  
- [Project structure](#project-structure)  
- [Scripts & useful commands](#scripts--useful-commands)  
- [Testing & CI (recommended)](#testing--ci-recommended)  
- [Refactor & contribution notes](#refactor--contribution-notes)  
- [Troubleshooting](#troubleshooting)  
- [License](#license)

---

## Tech stack

- Frontend
  - React (Vite)
  - Tailwind CSS
  - React Router
- Backend
  - Node.js + Express
  - Nodemailer (used for sending emails)
- Dev tools
  - Vite (frontend dev server + proxy)
  - (recommended) nodemon for backend auto-reload
  - (optional) concurrently to run both servers from one terminal

---

## Prerequisites (Windows)

- Node.js (LTS recommended) — npm comes bundled with Node.
  - Recommended: install via nvm-windows so you can manage Node versions:
    - nvm-windows: https://github.com/coreybutler/nvm-windows/releases
  - Alternative: official Node LTS installer: https://nodejs.org
- Git: https://git-scm.com/download/win
- (Optional) nodemon (global): `npm i -g nodemon`
- (Optional) concurrently (global): `npm i -g concurrently`

If you see `npm : The term 'npm' is not recognized ...` you need to install Node or re-open your terminal after installation — see Troubleshooting below.

---

## Get the code

```bash
git clone https://github.com/AnanyaKulkarni205/TailsOfBijapur.git
cd TailsOfBijapur
```

There are two folders: `frontend/` and `backend/`.

---

## Environment variables

Create a `.env` file in the `backend/` folder with at least these variables:

```
# backend/.env
PORT=4000
ADMIN_EMAIL=you@example.com

# SMTP for outgoing email (Mailtrap / production SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

Notes:
- If you don't need real email sending during local development, you can use a testing SMTP (Mailtrap) or provide placeholder values and skip email testing.
- Frontend: Vite proxies `/api` to `http://localhost:4000` by default (see `frontend/vite.config.js`), so you don't strictly need frontend env vars. If you prefer absolute API URLs, create `frontend/.env` with:
  ```
  VITE_API_BASE=http://localhost:4000/api
  ```

---

## Install & run (development)

Open two terminals (or use concurrently to run both together).

1. Frontend (Terminal A)
```bash
cd frontend
npm install
npm run dev
```
- Vite should start and provide a local URL (e.g. `http://localhost:5173`).

2. Backend (Terminal B)
```bash
cd backend
npm install
# create backend/.env as above
# start server:
# use dev script if available:
npm run dev
# otherwise:
node server.js
# or (recommended for development)
nodemon server.js
```
- The backend listens on the `PORT` from `.env` (default `4000`). The frontend dev server proxies `/api` to this backend.

Run both at once (optional):
```bash
# from repo root (after installing concurrently globally)
concurrently "cd backend && nodemon server.js" "cd frontend && npm run dev"
```

---

## Build & serve (production)

1. Build frontend:
```bash
cd frontend
npm run build
# This creates frontend/dist
```

2. Serve frontend statically
- Option A: Host `frontend/dist` on a static hosting provider (Netlify, Vercel, GitHub Pages, S3 + CloudFront).
- Option B: Serve via Express backend (single server). Example Express snippet to serve static build:

```javascript
// backend/app-static-serve.js (example)
import path from 'path'
import express from 'express'
const app = express()
app.use(express.static(path.join(__dirname, '../frontend/dist')))
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
})
app.listen(process.env.PORT || 4000)
```

3. Start backend normally (ensuring mail config is correct for production).

---

## Project structure (high-level)

- frontend/
  - src/ (React app)
  - public/ (images, videos, icons referenced by absolute paths like `/images/...`)
  - vite.config.js (dev proxy to backend)
  - tailwind.config.js
- backend/
  - server.js (Express server; contains routes for contact/volunteer/report and email sending)
  - (add .env here)
- README.md (this file)

---

## Scripts & useful commands

Frontend:
- `npm install` — install dependencies
- `npm run dev` — start Vite dev server
- `npm run build` — build production bundle
- `npm run preview` — preview built production bundle (if configured)

Backend:
- `npm install` — install dependencies
- `npm run dev` — start backend in dev mode (if the repo provides a script that uses nodemon)
- `node server.js` — run backend
- `nodemon server.js` — run backend with auto-reload (install nodemon globally or as dev dependency)

One-liner to run both (if you installed concurrently globally):
```bash
concurrently "cd backend && nodemon server.js" "cd frontend && npm run dev"
```

---

## Testing & CI (recommended)

This repository currently does not include tests or CI. Recommended improvements:
- Frontend: Vitest + React Testing Library for component tests
- Backend: Vitest/Jest + supertest for endpoint tests
- Add GitHub Actions workflow to run lint + tests on PRs

---

## Refactor & contribution notes

Areas to improve (useful for contributors):
- Extract reusable components (Hero, Card, Forms) from page components to reduce duplication.
- Move the adoptables mock array to a single JSON file or an `/api/adoptables` endpoint.
- Modularize backend into routes/controllers/services and add input validation (Joi / express-validator).
- Add ESLint / Prettier, Husky pre-commit hooks, and a `.env.example`.
- Introduce file size limits and sanitization on uploads (incident reports).
- Optimize images/videos and lazy-load heavy media for performance.

If you want to contribute:
1. Fork the repo.
2. Create a feature branch for your change.
3. Open a PR with a clear description and link to any issue.

---

## Troubleshooting

- Error: `npm : The term 'npm' is not recognized ...`
  - Install Node (LTS) or nvm-windows and re-open your terminal. See [Prerequisites](#prerequisites-windows).
- API 404s / `/api` returns nothing:
  - Ensure backend is running and the port matches `backend/.env`.
  - Vite proxies `/api` -> `http://localhost:4000` by default. If you changed backend port, update `frontend/vite.config.js` or use `VITE_API_BASE`.
- Media (images/videos) 404:
  - Confirm assets exist in `frontend/public` and use absolute paths starting with `/` (e.g. `/images/...`).
- Email sending fails:
  - Verify SMTP credentials in `backend/.env`. Use Mailtrap for local testing to avoid sending real emails.
- File upload fails:
  - Check backend support for multipart/form-data and file size limits. Ensure your frontend form uses `FormData` for uploads.

---

## License

No license file is included in the repository. If you want to apply a permissive license, add a `LICENSE` file (e.g., MIT) and update this README.

---

If you want, I can:
- Create `backend/.env.example` for you.
- Add a `README` section for contributors with suggested small starter issues.
- Generate a single-command `dev` script (root package.json) that runs both servers using `concurrently`.
- Produce a PR-ready patch that extracts one reusable component (e.g., `Hero`) and updates one page to use it.

Which of those would you like me to do next?
