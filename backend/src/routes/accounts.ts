import express from 'express';
import db from '../models/db.js';
import { requireAuth } from '../middlewares/index.js';
import type { Request, Response } from 'express';
import type { Router } from 'express';

import { calendarDate, calculateAccountForecast, type Account, type Transaction } from './previsions.js';

const router: Router = express.Router();

async function decorateAccount(account: Account) {
  const { rows: transactions } = await db.query(
    `SELECT t.*, row_to_json(r) AS recurrence_rule
     FROM transactions t
     LEFT JOIN recurrence_rules r ON r.transaction_id = t.id
     WHERE t.account_id = $1 ORDER BY t.start_date`,
    [account.id],
  );
  const target = new Date();
  target.setFullYear(target.getFullYear() + 1);
  const forecast = calculateAccountForecast(account, transactions as Transaction[], target.toISOString());
  const createdOn = calendarDate(account.created_on);
  return {
    ...account,
    created_on: `${createdOn.getFullYear()}-${String(createdOn.getMonth() + 1).padStart(2, '0')}-${String(createdOn.getDate()).padStart(2, '0')}`,
    initial_balance: Number(account.balance),
    balance: forecast.starting_balance,
    current_balance: forecast.starting_balance,
    forecast_12m: forecast.forecasted_balance,
  };
}

// GET /accounts, returns all accounts for the authenticated user
router.get('/', requireAuth, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Utilisateur non authentifié' });
  }

  try {
    // Récupérer l’ID de l’utilisateur connecté
    const userId: string = req.user.id;

    // On récupère les comptes et on calcule le solde réel à partir des transactions.
    const { rows } = await db.query(
      `SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_on DESC, id DESC`,
      [userId],
    );

    // Décorer chaque compte avec les champs calculés
    const data: (Account & { current_balance: number; forecast_12m: number })[] =
      await Promise.all(rows.map(decorateAccount));
    res.json({ data });
  } catch (err) {
    console.error('GET /accounts error', err);
    res.status(500).json({
      error: 'Erreur lors de la récupération des comptes.',
    });
  }
});

// POST /accounts, creates a new account for the authenticated user
router.post('/', requireAuth, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Utilisateur non authentifié' });
  }
  try {
    const userId: string = req.user.id;

    const {
      account_name,
      description = null,
      created_on,
      currency = 'EUR',
      balance = 0,
      annual_interest_rate = 0,
      tax_rate = 0,
    } = req.body || {};

    if (!account_name || !created_on) {
      return res.status(400).json({
        error: 'account_name et created_on sont obligatoires.',
      });
    }

    // Limiter chaque utilisateur à 10 comptes financiers pour éviter les abus.
    const maxAccounts = 10;
    const { rows: accountCountRows } = await db.query(
      'SELECT COUNT(*) as count FROM accounts WHERE user_id = $1',
      [userId],
    );

    const accountCount: number = parseInt(accountCountRows[0].count, 10);

    if (accountCount >= maxAccounts) {
      return res.status(403).json({
        error: 'Limite de comptes atteinte. Vous pouvez créer au maximum 10 comptes financiers.',
        limitReached: true,
        currentCount: accountCount,
        maxCount: maxAccounts,
      });
    }

    const { rows } = await db.query(
      `INSERT INTO accounts
       (user_id, account_name, description, created_on, currency, balance, annual_interest_rate, tax_rate)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        userId,
        account_name,
        description,
        created_on,
        currency,
        balance,
        annual_interest_rate,
        tax_rate,
      ],
    );

    const account: Account & { current_balance: number; forecast_12m: number } = await decorateAccount(
      rows[0],
    );
    res.status(201).json({ data: account });
  } catch (err) {
    console.error('POST /accounts error', err);
    res.status(500).json({
      error: 'Erreur lors de la création du compte.',
    });
  }
});

// PUT /accounts/:id, updates an existing account for the authenticated user
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Utilisateur non authentifié' });
  }
  try {
    const userId: string = req.user.id;
    const id: string | string[] = req.params.id;

    const {
      account_name,
      description,
      created_on,
      currency,
      balance,
      annual_interest_rate,
      tax_rate,
    } = req.body || {};

    const { rows, rowCount } = await db.query(
      `UPDATE accounts SET
         account_name          = COALESCE($1, account_name),
         description           = COALESCE($2, description),
         created_on            = COALESCE($3, created_on),
         currency              = COALESCE($4, currency),
         balance               = COALESCE($5, balance),
         annual_interest_rate  = COALESCE($6, annual_interest_rate),
         tax_rate              = COALESCE($7, tax_rate)
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [
        account_name,
        description,
        created_on,
        currency,
        balance,
        annual_interest_rate,
        tax_rate,
        id,
        userId,
      ],
    );

    if (!rowCount) {
      return res.status(404).json({ error: 'Compte introuvable.' });
    }

    res.json({ data: await decorateAccount(rows[0]) });
  } catch (err) {
    console.error('PUT /accounts/:id error', err);
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du compte.',
    });
  }
});

// DELETE /accounts/:id, deletes an existing account for the authenticated user
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Utilisateur non authentifié' });
  }
  try {
    const userId: string = req.user.id;
    const id: string | string[] = req.params.id;

    const result = await db.query('DELETE FROM accounts WHERE id = $1 AND user_id = $2', [
      id,
      userId,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Compte introuvable.' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('DELETE /accounts/:id error', err);
    res.status(500).json({
      error: 'Erreur lors de la suppression du compte.',
    });
  }
});

export default router;
