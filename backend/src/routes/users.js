import express from 'express';
import { requireAuth } from '/auth.js';
import * as userCtrl from '../controllers/usersController.js';

const router = express.Router();

router.get('/me', requireAuth, userCtrl.getProfile);
router.put('/me', requireAuth, userCtrl.updateProfile);
router.delete('/me', requireAuth, userCtrl.deleteAccount);

export default router;