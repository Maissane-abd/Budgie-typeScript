//backend/src/routes/users.ts
import express from 'express';
import type { Router } from 'express';
import { requireAuth } from './auth.js';
import { getProfile, updateProfile, deleteAccount } from '../controllers/usersController.ts';

const router: Router = express.Router();

router.get('/me', requireAuth, getProfile);
router.put('/me', requireAuth, updateProfile);
router.delete('/me', requireAuth, deleteAccount);

export default router;