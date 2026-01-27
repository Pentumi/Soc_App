import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  allowedOrigins: string[];
}

const parseAllowedOrigins = (origins: string): string[] => {
  if (origins === '*') return ['*'];
  return origins.split(',').map(o => o.trim());
};

const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  allowedOrigins: parseAllowedOrigins(process.env.ALLOWED_ORIGINS || 'http://localhost:3000'),
};

export default config;
