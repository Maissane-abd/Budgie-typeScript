// controllers/revenusController.js
import db from '../models/db.ts';
import { v4 as uuidv4 } from 'uuid';
import { checkIncomeLimit } from '../utils/subscription.ts';
import { Request, Response } from 'express';

export const getAll = async (req: Request, res: Response): Promise<void> => {
  
  if (!req.user) {
     res.status(401).json({ message: 'Utilisateur non authentifié' });
     return;
  }

  console.log("REQ.USER =", req.user);
  const userId:string = req.user.id;

  const { rows } = await db.query(`
    SELECT
      t.*,
      a.account_name
    FROM transactions t
           JOIN accounts a ON a.id = t.account_id
    WHERE t.transaction_type = 'income'
      AND a.user_id = $1
    ORDER BY t.start_date DESC
  `, [userId]);
  res.json(rows);


};

export const getById = async (req: Request, res: Response<{ message: string }>): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Utilisateur non authentifié' });
    return;
  }
  const userId: string = req.user.id;
  const { id } = req.params;
  const { rows } = await db.query(
      ` SELECT t.*
        FROM transactions t
               JOIN accounts a ON a.id = t.account_id
        WHERE
          t.id = $1
          AND t.transaction_type = 'income'
          AND a.user_id = $2
      `, [id, userId]);

  if (rows.length === 0) {
     res.status(404).json({ message: 'Revenu non trouvé' });
     return;
  }
  res.json(rows[0]);
};

export const create = async (req: Request, res: Response): Promise<void> => {

  let {
    account_id,
    transaction_name,
    amount,
    start_date,
    description,
    duration_type,
    interval_count,
    interval_unit,
    end_date
  } = req.body;

  // Validation des champs obligatoires

  if (!account_id || !transaction_name || !amount || !start_date) {
     res.status(400).json({
      message: 'Champs obligatoires manquants'
    });
    return;
  }

  if (end_date === "") {
    end_date = null;
  }

  if (amount <= 0) {
     res.status(400).json({
      message: 'Le montant doit être positif'
    });
    return;
  }

  if (duration_type === 'recurring') {
    if (!interval_count || interval_count < 1 || !interval_unit) {
       res.status(400).json({
        message: 'interval_count et interval_unit obligatoire pour un revenu récurrent'
      });
      return;
    }
  }

// Vérification de la propriété du compte

if (!req.user) {
    res.status(401).json({ message: 'Utilisateur non authentifié' });
    return;
  }

  const accountCheck = await db.query(
      `SELECT 1 FROM accounts WHERE id = $1 AND user_id = $2`,
      [account_id, req.user.id]
  );

  if (!accountCheck.rowCount) {
     res.status(403).json({ message: 'Compte non autorisé' });
     return;
  }

  // Vérifier la limite de revenus par compte
  const limitCheck = await checkIncomeLimit(req.user.id, account_id);
  if (limitCheck.limitReached) {
     res.status(403).json({
      message: `Limite de revenus atteinte. Vous avez atteint la limite de ${limitCheck.maxCount} revenus par compte du plan gratuit. Abonnez-vous au plan Premium pour des revenus illimités.`,
      limitReached: true,
      currentCount: limitCheck.currentCount,
      maxCount: limitCheck.maxCount
    });
    return;
  }

  // Insertion du nouveau revenu

  const { rows: transactionRows } = await db.query(
      `INSERT INTO transactions (
        account_id,
        transaction_name,
        transaction_type,
        amount,
        start_date,
        description,
        duration_type
      )
       VALUES ($1, $2, 'income', $3, $4, $5, $6)
         RETURNING *`,
      [
        account_id,
        transaction_name,
        amount,
        start_date,
        description,
        duration_type,
      ]
  );

  const transaction = transactionRows[0];

  // Créer la règle de récurrence si nécessaire
  if (duration_type === 'recurring') {
    await db.query(
        `INSERT INTO recurrence_rules 
       (transaction_id, interval_unit, interval_count, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5)`,
        [transaction.id, interval_unit, interval_count, start_date, end_date]
    );
  }

  res.status(201).json(transaction);
};

export const update = async (req: Request, res: Response<{ message: string }>): Promise<void> => {

  if (!req.user) {
    res.status(401).json({ message: 'Utilisateur non authentifié' });
    return;
  }

  const userId = req.user.id;
  const { id } = req.params;

  let {
    transaction_name,
    amount,
    start_date,
    description,
    duration_type,
    interval_count,
    interval_unit,
    end_date
  } = req.body;

  // Validation des champs obligatoires

  if (!transaction_name || !amount || !start_date) {
     res.status(400).json({
      message: 'Champs obligatoires manquants'
    });
    return;
  }

  if (amount <= 0) {
     res.status(400).json({
      message: 'Le montant doit être positif'
    });
    return;
  }

  if (end_date === "") {
    end_date = null;
  }

  if (duration_type === 'recurring') {
    if (!interval_count || interval_count < 1 || !interval_unit) {
       res.status(400).json({ message: 'interval_count et interval_unit obligatoires pour un revenu récurrent' });
       return;
    }
  }

  // Mise à jour du revenu
  const { rows : transactionRows } = await db.query(
      `
        UPDATE transactions t
        SET
          transaction_name = $1,
          amount = $2,
          start_date = $3,
          description = $4,
          duration_type = $5
          FROM accounts a
        WHERE
          t.id = $6
          AND t.transaction_type = 'income'
          AND a.id = t.account_id
          AND a.user_id = $7
          RETURNING t.*
      `,
      [
        transaction_name,
        amount,
        start_date,
        description,
        duration_type,
        id,
        userId
      ]
  );

  if (!transactionRows.length) {
   res.status(404).json({ message: 'Revenu non trouvé' });
   return;
  }

  // Mettre à jour ou créer la règle de récurrence
  if (duration_type === 'recurring') {
    const ruleCheck = await db.query(
        `SELECT id FROM recurrence_rules WHERE transaction_id = $1`,
        [id]
    );

    if (ruleCheck.rowCount) {
      // Update la règle existante
      await db.query(
          `UPDATE recurrence_rules
         SET interval_unit = $1,
             interval_count = $2,
             start_date = $3,
             end_date = $4
         WHERE transaction_id = $5`,
          [interval_unit, interval_count, start_date, end_date, id]
      );
    } else {
      // Créer une nouvelle règle
      await db.query(
          `INSERT INTO recurrence_rules
         (transaction_id, interval_unit, interval_count, start_date, end_date)
         VALUES ($1, $2, $3, $4, $5)`,
          [id, interval_unit, interval_count, start_date, end_date]
      );
    }
  } else {
    // Si on passe de récurrent à simple, supprimer la règle existante
    await db.query(`DELETE FROM recurrence_rules WHERE transaction_id = $1`, [id]);
  }

  res.json(transactionRows[0]);
};

export const remove = async (req: Request, res: Response<{ message: string }>): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Utilisateur non authentifié' });
    return;
  }
  const userId = req.user.id;
  const { id } = req.params;

  const result = await db.query(
      `
        DELETE FROM transactions t
          USING accounts a
        WHERE
          t.id = $1
          AND t.transaction_type = 'income'
          AND a.id = t.account_id
          AND a.user_id = $2
      `,
      [id, userId]
  );

  if (!result.rowCount) {
     res.status(404).json({ message: 'Revenu non trouvé' });
     return;
  }

  res.status(204).send();
};