// backend/src/routes/accounts.js
import express from "express";
import db from "../models/db.js";
import { requireAuth } from "./auth.js";

const router = express.Router();

/*
 * Calcule le solde prévisionnel après `months` mois
 * Intérêts composés mensuels, net d’impôts
 */
function computeForecast(account, months = 12) {
  const annualRate = Number(account.annual_interest_rate || 0) / 100;
  const taxRate = Number(account.tax_rate || 0) / 100;
  let balance = Number(account.balance || 0);

  const monthlyRate = annualRate / 12;

  for (let i = 0; i < months; i++) {
    const grossInterest = balance * monthlyRate;
    const netInterest = grossInterest * (1 - taxRate);
    balance += netInterest;
  }

  return balance;
}

/*
 * Ajoute des champs calculés à un compte
 */
function decorateAccount(a) {

  const balance = Number(a.balance || 0);
  const annualRate = Number(a.annual_interest_rate || 0);
  const taxRate = Number(a.tax_rate || 0);

  const monthlyRate = annualRate / 100 / 12;
  const grossMonth = balance * monthlyRate;
  const netMonth = grossMonth * (1 - taxRate / 100);

  return {
    ...a,
    balance: Number(balance.toFixed(2)),
    current_balance: Number((balance + netMonth).toFixed(2)),
    forecast_12m: Number(computeForecast(a, 12).toFixed(2)),
  };
}


/*
 * GET /api/accounts
 * Liste des comptes de l’utilisateur connecté
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    // Récupérer l’ID de l’utilisateur connecté 
    const userId = req.user.id;

    // On récupère les comptes et on calcule le solde réel à partir des transactions.
    const { rows } = await db.query(
        `SELECT
           a.*,
           (
             COALESCE(a.balance, 0) +
             COALESCE(
                 SUM(
                     CASE
                       WHEN t.transaction_type = 'income' THEN t.amount
                       WHEN t.transaction_type = 'expense' THEN -t.amount
                       ELSE 0
                       END
                 ), 0
             )
             ) AS balance
         FROM accounts a
                LEFT JOIN transactions t ON t.account_id = a.id
         WHERE a.user_id = $1
         GROUP BY a.id
         ORDER BY a.created_on DESC, a.id DESC`,
        [userId]
    );

    // Décorer chaque compte avec les champs calculés
    const data = rows.map(decorateAccount);
    res.json({ data });
  } catch (err) {
    console.error("GET /accounts error", err);
    res.status(500).json({
      error: "Erreur lors de la récupération des comptes.",
    });
  }
});

/*
 * POST /api/accounts
 * Body JSON :
 * {
 *   account_name,
 *   description,
 *   created_on,
 *   currency,
 *   balance,
 *   annual_interest_rate,
 *   tax_rate
 * }
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      account_name,
      description = null,
      created_on,
      currency = "EUR",
      balance = 0,
      annual_interest_rate = 0,
      tax_rate = 0,
    } = req.body || {};

    if (!account_name || !created_on) {
      return res.status(400).json({
        error: "account_name et created_on sont obligatoires.",
      });
    }

    // Vérifier si l'utilisateur a un abonnement Premium actif
    const { rows: subscriptionRows } = await db.query(
      `SELECT s.id
       FROM subscriptions s
       JOIN plans p ON p.id = s.plan_id
       WHERE s.user_id = $1 
       AND s.status = 'active'
       AND p.plan_name = 'Premium'
       AND (s.ends_at IS NULL OR s.ends_at > NOW())
       LIMIT 1`,
      [userId]
    );

    const hasPremiumSubscription = subscriptionRows.length > 0;

    // Si l'utilisateur n'a pas d'abonnement Premium, vérifier la limite de 2 comptes
    if (!hasPremiumSubscription) {
      const { rows: accountCountRows } = await db.query(
        "SELECT COUNT(*) as count FROM accounts WHERE user_id = $1",
        [userId]
      );

      const accountCount = parseInt(accountCountRows[0].count, 10);

      if (accountCount >= 2) {
        return res.status(403).json({
          error: "Limite de comptes atteinte. Vous avez atteint la limite de 2 comptes du plan gratuit. Abonnez-vous au plan Premium pour créer des comptes illimités.",
          limitReached: true,
          currentCount: accountCount,
          maxCount: 2,
        });
      }
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
      ]
    );

    const account = decorateAccount(rows[0]);
    res.status(201).json({ data: account });
  } catch (err) {
    console.error("POST /accounts error", err);
    res.status(500).json({
      error: "Erreur lors de la création du compte.",
    });
  }
});

/*
 * PUT /api/accounts/:id
 * Mise à jour d’un compte
 */
router.put("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;

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
      ]
    );

    if (!rowCount) {
      return res.status(404).json({ error: "Compte introuvable." });
    }

    res.json({ data: decorateAccount(rows[0]) });
  } catch (err) {
    console.error("PUT /accounts/:id error", err);
    res.status(500).json({
      error: "Erreur lors de la mise à jour du compte.",
    });
  }
});

/*
 * DELETE /api/accounts/:id
 * Suppression d’un compte
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;

    const result = await db.query(
      "DELETE FROM accounts WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Compte introuvable." });
    }

    res.status(204).send();
  } catch (err) {
    console.error("DELETE /accounts/:id error", err);
    res.status(500).json({
      error: "Erreur lors de la suppression du compte.",
    });
  }
});

export default router;
