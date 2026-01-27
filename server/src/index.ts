import express from 'express';
import cors from 'cors';
import path from 'path';
import config from './config/env';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import tournamentRoutes from './routes/tournaments';
import scoreRoutes from './routes/scores';
import courseRoutes from './routes/courses';
import handicapRoutes from './routes/handicaps';
import societyRoutes from './routes/society';
import standingsRoutes from './routes/standings';

const app = express();

console.log('CORS allowed origins:', config.allowedOrigins);

// Configure CORS - allow all origins if '*' is specified, otherwise use the list
const corsOptions = config.allowedOrigins.includes('*')
  ? { origin: true, credentials: true }
  : { origin: config.allowedOrigins, credentials: true };

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/handicaps', handicapRoutes);
app.use('/api/society', societyRoutes);
app.use('/api/standings', standingsRoutes);

// Serve static files from React build in production
if (config.nodeEnv === 'production') {
  const clientBuildPath = path.join(__dirname, '../../client/build');
  app.use(express.static(clientBuildPath));

  // Handle React routing - return index.html for all non-API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

app.use(errorHandler);

const server = app.listen(config.port, () => {
  console.log(`✅ Server running on port ${config.port}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🗄️  Database: ${config.databaseUrl ? 'Connected' : 'Not configured'}`);
  console.log(`🌐 Server ready at http://localhost:${config.port}`);
});

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${config.port} is already in use`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;
