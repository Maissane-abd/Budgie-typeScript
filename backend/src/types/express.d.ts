export type AuthUser = {
  id: string;
  email: string;
};

// Augment the Express Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Augment the Express Request interface to include the user property
declare module 'express' {
  interface Request {
    user?: AuthUser; 
  }
}
