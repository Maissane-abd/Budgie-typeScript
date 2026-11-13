import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/jwt.js';
export const corsMiddleware = cors({
    origin: ['http:localhost:80', 'https://budgie.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
});
export const jsonMiddleware = express.json();
// Middleware to require authentication for certain routes
export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];
    if (!token)
        return res.status(401).json({ error: 'Token manquant' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded.id, email: decoded.email };
        next();
    }
    catch (err) {
        res.status(401).json({ error: 'Token invalide' });
    }
}
