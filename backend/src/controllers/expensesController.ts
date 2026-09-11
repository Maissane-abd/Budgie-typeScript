// controllers/expensesController.js
import db from '../models/db.ts';
import { checkExpenseLimit } from '../utils/subscription.js';
import type { Request, Response } from 'express';
import type { LimitCheckResult } from '../utils/subscription.ts';

// GET /expenses
export const getAll = async (req: Request, res: Response): Promise<void> => {

    if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Utilisateur non authentifié' });
        return;
    }

    const userId: string = req.user.id;

    const { rows } = await db.query(`
        SELECT
            t.*,
            a.account_name
        FROM transactions t
                 JOIN accounts a ON a.id = t.account_id
        WHERE t.transaction_type = 'expense'
          AND a.user_id = $1
        ORDER BY t.start_date DESC
    `, [userId]);

    res.json(rows);
};

// GET /expenses/:id
export const getById = async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Utilisateur non authentifié' });
        return;
    }
    const userId: string = req.user.id;
    const { id } = req.params;

    const { rows } = await db.query(`
        SELECT t.*
        FROM transactions t
                 JOIN accounts a ON a.id = t.account_id
        WHERE t.id = $1
          AND t.transaction_type = 'expense'
          AND a.user_id = $2
    `, [id, userId]);

    if (rows.length === 0) {
         res.status(404).json({ message: 'Dépense non trouvée' });
         return;
    }

    res.json(rows[0]);
};

// POST /expenses
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

    // Champs obligatoires
    if (!account_id || !transaction_name || !amount || !start_date) {
        res.status(400).json({ message: 'Champs obligatoires manquants' });
        return;
    }

    if (amount <= 0) {
        res.status(400).json({ message: 'Le montant doit être positif' });
        return;
    }

    if (end_date === "") {
        end_date = null;
    }

    if (duration_type === 'recurring') {
        if (!interval_count || interval_count < 1 || !interval_unit) {
            res.status(400).json({
                message: 'interval_count et interval_unit obligatoires pour une dépense récurrente'
            });
            return;
        }
    }

    // Vérifier que le compte appartient à l'utilisateur

    if (!req.user || !req.user.id) {
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

    // Vérifier la limite de dépenses par compte
    const limitCheck: LimitCheckResult = await checkExpenseLimit(req.user.id, account_id);
    if (limitCheck.limitReached) {
         res.status(403).json({
            message: `Limite de dépenses atteinte. Vous avez atteint la limite de ${limitCheck.maxCount} dépenses par compte du plan gratuit. Abonnez-vous au plan Premium pour des dépenses illimitées.`,
            limitReached: true,
            currentCount: limitCheck.currentCount,
            maxCount: limitCheck.maxCount
        })
        return;
    }

    // Insert transaction expense
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
         VALUES ($1, $2, 'expense', $3, $4, $5, $6)
             RETURNING *`,
        [
            account_id,
            transaction_name,
            amount,
            start_date,
            description,
            duration_type
        ]
    );

    const transaction = transactionRows[0];

    // Insert recurrence rule si récurrent
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

// PUT /expenses/:id
export const update = async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Utilisateur non authentifié' });
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

    if (!transaction_name || !amount || !start_date) {
        return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }

    if (end_date === "") {
        end_date = null;
    }

    if (amount <= 0) {
        return res.status(400).json({ message: 'Le montant doit être positif' });
    }

    if (duration_type === 'recurring') {
        if (!interval_count || interval_count < 1 || !interval_unit) {
            return res.status(400).json({
                message: 'interval_count et interval_unit obligatoires pour une dépense récurrente'
            });
        }
    }

    // Update transaction (avec contrôle ownership)
    const { rows: transactionRows } = await db.query(`
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
          AND t.transaction_type = 'expense'
          AND a.id = t.account_id
          AND a.user_id = $7
            RETURNING t.*
    `, [
        transaction_name,
        amount,
        start_date,
        description,
        duration_type,
        id,
        userId
    ]);

    if (!transactionRows.length) {
        return res.status(404).json({ message: 'Dépense non trouvée' });
    }

    // Recurrence: update / insert / delete
    if (duration_type === 'recurring') {
        const ruleCheck = await db.query(
            `SELECT id FROM recurrence_rules WHERE transaction_id = $1`,
            [id]
        );

        if (ruleCheck.rowCount) {
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
            await db.query(
                `INSERT INTO recurrence_rules
                     (transaction_id, interval_unit, interval_count, start_date, end_date)
                 VALUES ($1, $2, $3, $4, $5)`,
                [id, interval_unit, interval_count, start_date, end_date]
            );
        }
    } else {
        await db.query(`DELETE FROM recurrence_rules WHERE transaction_id = $1`, [id]);
    }

    res.json(transactionRows[0]);
};

// DELETE /expenses/:id
export const remove = async (req: Request, res: Response) => {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }
    const userId = req.user.id;
    const { id } = req.params;

    const result = await db.query(`
        DELETE FROM transactions t
            USING accounts a
        WHERE
            t.id = $1
          AND t.transaction_type = 'expense'
          AND a.id = t.account_id
          AND a.user_id = $2
    `, [id, userId]);

    if (!result.rowCount) {
        return res.status(404).json({ message: 'Dépense non trouvée' });
    }

    res.status(204).send();
};