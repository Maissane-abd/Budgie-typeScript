// backend/src/routes/expenses.js
import express from 'express';
import { create, getAll, getById, update, remove } from '../controllers/expensesController.js';
import { requireAuth } from './auth.js';

const router = express.Router();

// Routes for expenses
router.post('/', requireAuth, create);
router.get('/', requireAuth, getAll);
router.get('/:id', requireAuth, getById);
router.put('/:id', requireAuth, update);
router.delete('/:id', requireAuth, remove);

export default router;
