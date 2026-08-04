# Attorney CMS Backend

Node.js/Express CMS backed by PostgreSQL.

## Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set `DATABASE_URL` to your Postgres connection string, then start:
   ```bash
   export DATABASE_URL=postgres://postgres:postgres@localhost:5433/test_site
   npm run dev
   ```

The server will run on http://localhost:5001

## Default Login

- Username: `ADMIN_USERNAME` env var value
- Password: `ADMIN_PASSWORD` env var value

## API Endpoints

### Authentication
- `POST /api/login` - Login with username/password

### Attorneys (requires authentication)
- `GET /api/attorneys` - Get all attorneys
- `GET /api/attorneys/:id` - Get single attorney
- `POST /api/attorneys` - Create new attorney
- `PUT /api/attorneys/:id` - Update attorney
- `DELETE /api/attorneys/:id` - Delete attorney

### File Upload
- `POST /api/upload` - Upload photo (requires authentication)

## Admin Interface

Visit http://localhost:5001/admin to access the CMS interface.

## Database

The app uses PostgreSQL via `DATABASE_URL`. Schema is created automatically on startup.

### Local Docker Postgres (optional)

```bash
docker start test-site-pg
# or create once:
# docker run -d --name test-site-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_USER=postgres -e POSTGRES_DB=test_site -p 5433:5432 postgres:16-alpine
```

Connection string:

```
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/test_site
```

### Loading a backup into another Postgres (e.g. Render)

If you have `backend/.db-backup/test_site.dump`:

```bash
pg_restore --clean --if-exists --no-owner --no-acl \
  -d "$DATABASE_URL" backend/.db-backup/test_site.dump
```

For Render, use the **External Database URL** as `DATABASE_URL`.

## Security Notes

- Set strong values for `ADMIN_PASSWORD` and `JWT_SECRET` in production
- Set `ALLOWED_ORIGINS` to your frontend domain(s)

## Render Deployment (Web Service)

Use these settings:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Disk mount (recommended): `/var/data` for uploaded files
- Attach a Render Postgres instance and set `DATABASE_URL` from it (Blueprint does this via `render.yaml`)

Required env vars:

- `DATABASE_URL=<postgres connection string>`
- `JWT_SECRET=<strong random value>`
- `ADMIN_USERNAME=<admin email>`
- `ADMIN_PASSWORD=<strong password>`
- `ALLOWED_ORIGINS=https://<your-frontend>.onrender.com,https://<your-backend>.onrender.com`
- `UPLOAD_DIR=/var/data/uploads`

You can provide multiple origins as CSV:

```
ALLOWED_ORIGINS=https://www.yourdomain.com,https://your-frontend.onrender.com
```
