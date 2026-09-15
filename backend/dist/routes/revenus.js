// backend/src/routes/revenus.ts
import express from 'express';
import { create, getAll, getById, update, remove } from '../controllers/revenusController.js';
import { requireAuth } from './auth.js';
const router = express.Router();
// Routes for revenus
router.post('/', requireAuth, create);
router.get('/', requireAuth, getAll);
router.get('/:id', requireAuth, getById);
router.put('/:id', requireAuth, update);
router.delete('/:id', requireAuth, remove);
export default router;
