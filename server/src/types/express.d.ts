declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
      file?: Express.Multer.File;
    }
  }
}

export {};
