import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/jwt.js';

export const corsMiddleware = cors({
  origin: ['http:localhost:80', 'https://budgie.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

export const jsonMiddleware = express.json();

// Middleware to require authentication for certain routes
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader: string = req.headers.authorization || '';
  const token: string = authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token manquant' });

  try {
    const decoded: string | jwt.JwtPayload = jwt.verify(token, JWT_SECRET);
    if (
      typeof decoded === 'string' ||
      typeof decoded.id !== 'string' ||
      typeof decoded.email !== 'string'
    ) {
      return res.status(401).json({ error: 'Token invalide' });
    }

    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    console.error('Erreur de vérification du token :', err);
    res.status(401).json({ error: 'Token invalide' });
  }
}
