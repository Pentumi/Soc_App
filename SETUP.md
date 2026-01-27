# Golf Society App - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/download/)
3. **Git** (optional, for version control)

## Database Setup

### 1. Create PostgreSQL Database

Open PostgreSQL and create a new database:

```sql
CREATE DATABASE golf_society_db;
```

Alternatively, using command line:

```bash
psql -U postgres
CREATE DATABASE golf_society_db;
\q
```

### 2. Update Database Credentials

The default credentials in `server/.env` are:
- Username: `postgres`
- Password: `postgres`
- Database: `golf_society_db`

If your PostgreSQL uses different credentials, update the `DATABASE_URL` in `server/.env`:

```
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/golf_society_db?schema=public"
```

## Backend Setup

### 1. Navigate to Server Directory

```bash
cd soc-app/server
```

### 2. Install Dependencies

Dependencies are already installed, but if needed:

```bash
npm install
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Run Database Migrations

This will create all the necessary tables in your database:

```bash
npx prisma migrate dev --name init
```

If prompted for a migration name, use: `init`

### 5. (Optional) View Database

To view your database structure using Prisma Studio:

```bash
npx prisma studio
```

This will open a browser interface at `http://localhost:5555`

### 6. Start the Backend Server

```bash
npm run dev
```

The backend server will start on `http://localhost:5000`

You should see:
```
Server running on port 5000
Environment: development
```

## Frontend Setup

### 1. Open a New Terminal

Keep the backend server running, and open a new terminal window.

### 2. Navigate to Client Directory

```bash
cd soc-app/client
```

### 3. Install Dependencies

Dependencies are already installed, but if needed:

```bash
npm install
```

### 4. Start the Frontend Development Server

```bash
npm start
```

The React app will start on `http://localhost:3000` and should automatically open in your browser.

## First-Time Usage

### 1. Register an Admin User

1. Navigate to `http://localhost:3000/register`
2. Fill in your details:
   - First Name
   - Last Name
   - Email
   - Password
   - **Role: Select "Admin"**
3. Click "Register"

You'll be automatically logged in and redirected to the dashboard.

### 2. Add Golf Courses

1. Click "Courses" in the navigation
2. Click "Add Course"
3. Enter course details:
   - Course Name (e.g., "Portmarnock Golf Club")
   - Location (e.g., "Portmarnock, Dublin")
   - Par (e.g., 72)
   - Slope Rating (optional)
   - Course Rating (optional)

### 3. Add Society Members

1. Click "Members" in the navigation
2. Click "Add Member"
3. Fill in member details:
   - First Name
   - Last Name
   - Email
   - Password (they'll use this to login)
   - Initial Handicap (optional - you can set it now or later)

### 4. Create a Tournament

1. Click "Tournaments" in the navigation
2. Click "Create Tournament"
3. Fill in tournament details:
   - Tournament Name (e.g., "Spring Major 2024")
   - Course (select from dropdown)
   - Date
   - Major Tournament checkbox (checked by default - affects handicaps)

### 5. Enter Tournament Scores

1. Click on a tournament from the list
2. Click "Enter Score"
3. Select a player and enter their gross score
4. The net score will be calculated automatically (gross - handicap)
5. Repeat for all players

### 6. Complete the Tournament

Once all scores are entered:

1. Click "Complete Tournament"
2. Confirm the action
3. The system will automatically:
   - Calculate final positions
   - Adjust the winner's handicap (-2 strokes)
   - Adjust last place's handicap (+1 stroke)
   - Record all changes in handicap history

## Application Features

### Admin Features
- Create and manage tournaments
- Add/edit society members
- Enter tournament scores
- Manage golf courses
- Complete tournaments (triggers handicap adjustments)
- View all leaderboards and statistics

### Member Features (all users)
- View personal handicap and history
- View tournament leaderboards
- View society member list
- View upcoming tournaments
- View personal tournament history

## Handicap System

The society uses a simple handicap adjustment system:

- **Winner (1st place)**: -2 strokes
- **Last Place**: +1 stroke
- **All other positions**: No change

Adjustments are only made for tournaments marked as "Major" tournaments.

## Troubleshooting

### Backend won't start

1. Check PostgreSQL is running:
   ```bash
   # Windows
   services.msc (look for postgresql service)

   # Check connection
   psql -U postgres -d golf_society_db
   ```

2. Verify database URL in `server/.env`

3. Try regenerating Prisma client:
   ```bash
   cd server
   npx prisma generate
   ```

### Frontend won't start

1. Clear node_modules and reinstall:
   ```bash
   cd client
   rm -rf node_modules
   npm install
   ```

2. Check the API URL in `client/.env` is correct

### Database migration errors

1. Reset the database (WARNING: deletes all data):
   ```bash
   cd server
   npx prisma migrate reset
   ```

2. Or manually drop and recreate:
   ```sql
   DROP DATABASE golf_society_db;
   CREATE DATABASE golf_society_db;
   ```
   Then run migrations again:
   ```bash
   npx prisma migrate dev
   ```

## Development Tips

### Running Both Servers

Use two terminal windows:

**Terminal 1 (Backend)**:
```bash
cd soc-app/server
npm run dev
```

**Terminal 2 (Frontend)**:
```bash
cd soc-app/client
npm start
```

### Viewing Database

```bash
cd server
npx prisma studio
```

### Checking API Endpoints

Health check: `http://localhost:5000/health`

API endpoints:
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/tournaments` - List tournaments
- `GET /api/users` - List members
- etc.

## Next Steps

Once you have the basic setup working:

1. Add all your society members
2. Add the golf courses you regularly play
3. Create your first tournament
4. Enter scores and complete the tournament
5. Watch the handicaps adjust automatically!

## Production Deployment

For production deployment, you'll need to:

1. Update environment variables (remove default passwords)
2. Use a production PostgreSQL database (not localhost)
3. Build the React app: `npm run build`
4. Use a process manager like PM2 for the backend
5. Set up proper HTTPS/SSL
6. Configure CORS for your production domain

Refer to the main README.md for more information.
