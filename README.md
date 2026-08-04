# MLL Law Homepage

A React-based homepage for MLL Law, specializing in fire and explosion litigation while showcasing other practice areas.

## Features

- Hero slideshow highlighting fire/explosion expertise
- Navigation bar with practice areas dropdown
- Section for additional practice areas
- Responsive design

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

To build for production:
```
npm run build
```

## Deploying on Render

This repository is split into:

- Frontend: Vite/React app at the repository root
- Backend: Node/Express app in `backend` (PostgreSQL)

You can deploy in two ways:

1. Blueprint (recommended): use `render.yaml` and deploy both services + Postgres together.
2. Manual setup: create one Static Site (frontend), one Web Service (backend), and one PostgreSQL database.

### Option 1: Blueprint deploy

1. Push this repo to GitHub.
2. In Render, create a new Blueprint and select this repository.
3. Render will read `render.yaml` and create the frontend, backend, and Postgres DB.
4. Set `ADMIN_USERNAME` / `ADMIN_PASSWORD` when prompted.
5. Update generated service URLs in env vars if your names differ:
    - `VITE_API_BASE_URL` (frontend) -> your backend Render URL
    - `ALLOWED_ORIGINS` (backend) -> your frontend Render URL
6. Load your Postgres data into Render once (from a local dump or Docker DB):

```bash
# Example using the local backup dump:
pg_restore --clean --if-exists --no-owner --no-acl \
  -d '<Render External Database URL>' backend/.db-backup/test_site.dump
```

### Option 2: Manual Render settings

Frontend (Static Site):

- Root Directory: `.`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment Variable: `VITE_API_BASE_URL=https://<your-backend>.onrender.com`

Backend (Web Service):

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Add Disk: mount path `/var/data` (for uploaded files)
- Create a PostgreSQL database and copy its Internal Database URL into `DATABASE_URL`
- Environment Variables:
   - `DATABASE_URL=<from Render Postgres>`
   - `JWT_SECRET=<strong random value>`
   - `ADMIN_USERNAME=<your admin email>`
   - `ADMIN_PASSWORD=<strong password>`
   - `ALLOWED_ORIGINS=https://test-site-vtfd.onrender.com,https://mll-backend.onrender.com`
   - `UPLOAD_DIR=/var/data/uploads`

If you also use a custom domain, include it in `ALLOWED_ORIGINS` as a comma-separated list.

Example:

```
ALLOWED_ORIGINS=https://www.yourdomain.com,https://your-frontend.onrender.com
```

## Technologies

- React
- Vite
- CSS

## Notes

- Replace placeholder images in HeroSlider.jsx with actual relevant images.
- Update links and content as needed for the live site.
