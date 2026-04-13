# Attorney CMS Backend

This is a simple Node.js/Express backend with SQLite database for managing attorneys.

## Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

The server will run on http://localhost:5000

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

Visit http://localhost:5000/admin to access the CMS interface.

## Database

The app uses SQLite (`attorneys.db`) which will be created automatically on first run.

## Security Notes

- Set strong values for `ADMIN_PASSWORD` and `JWT_SECRET` in production
- Set `ALLOWED_ORIGINS` to your frontend domain(s)
- Consider using a more robust database like PostgreSQL for production

## Render Deployment (Web Service)

Use these settings:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Disk mount (recommended): `/var/data`

Required env vars:

- `JWT_SECRET=<strong random value>`
- `ADMIN_USERNAME=<admin email>`
- `ADMIN_PASSWORD=<strong password>`
- `ALLOWED_ORIGINS=https://<your-frontend>.onrender.com`
- `SQLITE_PATH=/var/data/attorneys.db`
- `UPLOAD_DIR=/var/data/uploads`

You can provide multiple origins as CSV:

```
ALLOWED_ORIGINS=https://www.yourdomain.com,https://your-frontend.onrender.com
```