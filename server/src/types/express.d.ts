import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
      };
      file?: Express.Multer.File;
    }
  }
}

export {};
