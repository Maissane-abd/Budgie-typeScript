import express from 'express';
import { create, getByTransaction, update, deleteException } from '../controllers/exceptionsController.js';
const router = express.Router();
router.post('/', create);
router.get('/revenu/:revenuId', getByTransaction);
router.put('/:id', update);
router.delete('/:id', deleteException);
export default router;
