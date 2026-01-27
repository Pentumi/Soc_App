# ⛳ Golf Society App

A modern, mobile-friendly golf society management application for tracking handicaps, managing tournaments, and viewing leaderboards.

![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql)

## ✨ Features

- 🏌️ **Member Management** - Track society members with profiles and handicaps
- 🏆 **Tournament Management** - Create and manage Stableford/Stroke Play tournaments
- 📊 **Score Entry** - Record tournament scores with automatic calculations
- 📈 **Handicap Tracking** - Automatic adjustments based on tournament results
- 🏅 **Leaderboards** - View tournament results and Golfer of the Year standings
- 📱 **Mobile-Friendly** - Responsive design with hamburger navigation
- 🎨 **Modern UI** - Clean, Squabbit-inspired card-based interface
- 👑 **Admin Controls** - Full tournament, member, and society management

## 🚀 Technology Stack

**Frontend**
- React 19 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- React Query for state management

**Backend**
- Node.js with Express
- TypeScript
- PostgreSQL database
- Prisma ORM
- JWT authentication
- bcrypt for password hashing

## 📁 Project Structure

```
soc-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # Auth context
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Auth & validation
│   │   ├── routes/        # API routes
│   │   └── config/        # Configuration
│   ├── prisma/           # Database schema
│   └── package.json
├── package.json          # Root workspace config
├── railway.toml          # Railway deployment config
└── nixpacks.toml         # Build configuration
```

## 🏃 Quick Start

See **[QUICK-START.md](QUICK-START.md)** for 5-minute Railway deployment!

### Local Development

**Prerequisites:**
- Node.js v18+
- PostgreSQL v14+
- npm

**Setup:**

1. Clone the repository
   ```bash
   git clone https://github.com/Pentumi/Soc_App.git
   cd Soc_App
   ```

2. Install dependencies
   ```bash
   # Install server dependencies
   cd server && npm install

   # Install client dependencies
   cd ../client && npm install
   ```

3. Configure environment variables
   ```bash
   # Copy example env files
   cp server/.env.example server/.env
   cp client/.env.example client/.env

   # Edit server/.env with your database URL and JWT secret
   ```

4. Run database migrations
   ```bash
   cd server
   npx prisma migrate dev
   npx prisma generate
   ```

5. Start development servers
   ```bash
   # Terminal 1 - Backend
   cd server && npm run dev

   # Terminal 2 - Frontend
   cd client && npm start
   ```

6. Open http://localhost:3000

## 🌐 Deployment

This app is optimized for **Railway** deployment:

1. Push to GitHub ✅
2. Connect to Railway
3. Add PostgreSQL database
4. Configure environment variables
5. Deploy!

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for detailed deployment guide.

**Estimated Cost:** $5-10/month for small golf societies

## 🎯 Handicap System

Simple and effective:
- 🏆 **Winner**: -2 strokes
- 📉 **Last Place**: +1 stroke
- ➡️ **All others**: No change

Adjustments happen automatically after Major tournaments.

## 📱 Mobile Features

- ✅ Responsive hamburger navigation
- ✅ Touch-friendly card interfaces
- ✅ Floating action buttons (FAB) for quick actions
- ✅ Optimized layouts for all screen sizes
- ✅ Expandable round cards (Squabbit-inspired)

## 🔐 Authentication

- JWT-based authentication
- Secure password hashing with bcrypt
- Admin/Member role-based access control
- Protected routes

## 📄 License

Private - Golf Society Internal Use

## 🤝 Contributing

This is a private golf society application.

## 📧 Support

For issues or questions, contact the repository owner.

---

Built with ⛳ for golf societies everywhere
