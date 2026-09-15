import type { Request, Response } from 'express';
import db from '../models/db.js';

// Créer une exception pour un revenu (transaction income)
export const create = async (req: Request, res: Response): Promise<void> => {
  const {
    transaction_id,
    exception_name,
    description,
    started_at,
    ends_at,
    override_amount,
    override_n_months
  } = req.body;

  if (!transaction_id || !exception_name || !started_at) {
    res.status(400).json({ message: 'transaction_id, exception_name et started_at sont requis' });
    return;
  }

  try {
    const { rows } = await db.query(
      `INSERT INTO transaction_exceptions (
        transaction_id,
        exception_name,
        description,
        started_at,
        ends_at,
        override_amount,
        override_n_months
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        transaction_id,
        exception_name,
        description,
        started_at,
        ends_at,
        override_amount,
        override_n_months
      ]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    if(err instanceof Error) {
      res.status(400).json({ message: err.message });
    }
  }
};

// Récupérer toutes les exceptions d’un revenu (transaction income)
export const getByTransaction = async (req: Request, res: Response): Promise<void> => {
  const { transactionId } = req.params;

  if (!transactionId) {
    res.status(400).json({ message: 'ID de la transaction requis' });
    return;
  }

  try {
    const { rows } = await db.query(
      `SELECT te.*
       FROM transaction_exceptions te
       JOIN transactions t ON t.id = te.transaction_id
       WHERE te.transaction_id = $1
       AND t.transaction_type = 'income'`,
      [transactionId]
    );

    res.json(rows);
  } catch (err) {
   if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    }
  }
};

// Mettre à jour une exception
export const update = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    exception_name,
    description,
    started_at,
    ends_at,
    override_amount,
    override_n_months
  } = req.body;

  if (!id) {
    res.status(400).json({ message: 'ID de l’exception requis' });
    return;
  }

  try {
    const { rows } = await db.query(
      `UPDATE transaction_exceptions
       SET
         exception_name = $1,
         description = $2,
         started_at = $3,
         ends_at = $4,
         override_amount = $5,
         override_n_months = $6
       WHERE id = $7
       RETURNING *`,
      [
        exception_name,
        description,
        started_at,
        ends_at,
        override_amount,
        override_n_months,
        id
      ]
    );

    if (rows.length === 0) {
      res.status(404).json({ message: 'Exception non trouvée' });
      return;
    }

    res.json(rows[0]);
  } catch (err) {
  if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    }
  }
};

// Supprimer une exception
export const deleteException = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ message: 'ID de l’exception requis' });
    return;
  }

  try {
    const result = await db.query(
      `DELETE FROM transaction_exceptions
       WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Exception non trouvée' });
      return;
    }

    res.status(204).send();
  } catch (err) {
   if (err instanceof Error) {
      res.status(400).json({ message: err.message });
    }
  }
};