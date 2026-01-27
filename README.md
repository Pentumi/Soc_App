# Golf Society App

A web-based golf society application for tracking handicaps, managing tournaments, and viewing leaderboards.

## Features

- **Member Management**: Track society members with profiles and handicaps
- **Tournament Management**: Create and manage Major tournaments
- **Score Entry**: Record tournament scores (gross and net)
- **Handicap Tracking**: Automatic handicap adjustments based on tournament results
- **Leaderboards**: View tournament results and season standings
- **Admin Controls**: Full tournament and member management

## Technology Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Node.js with Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens

## Project Structure

```
soc-app/
├── client/          # React frontend
├── server/          # Node.js backend
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```
3. Install client dependencies:
   ```bash
   cd client
   npm install
   ```
4. Set up environment variables (see server/.env.example)
5. Run database migrations:
   ```bash
   cd server
   npx prisma migrate dev
   ```
6. Start the development servers:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm start
   ```

## Handicap System

The society uses a simple handicap adjustment system:
- **Winner**: -2 strokes
- **Last Place**: +1 stroke
- All other positions: no change

Adjustments are made after each Major tournament (6-7 per year).

## License

Private - Golf Society Internal Use
