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

- Username: `admin`
- Password: `admin123`

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

- Change the default password in production
- Use environment variables for JWT_SECRET
- Add proper CORS configuration for production
- Consider using a more robust database like PostgreSQL for production