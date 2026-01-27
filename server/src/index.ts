import express from 'express';
import cors from 'cors';
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

app.use(cors({
  origin: config.allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/handicaps', handicapRoutes);
app.use('/api/society', societyRoutes);
app.use('/api/standings', standingsRoutes);

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
});

export default app;
