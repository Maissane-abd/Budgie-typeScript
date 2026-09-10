// backend/src/routes/previsions.js
// Routes et contrôleurs pour le calcul des prévisions financières

import express from "express";
import db from "../models/db.ts";
import { requireAuth } from "./auth.ts";
import { Request, Response } from "express";
import type { Router } from "express";

const router: Router = express.Router();

type Transaction = {
  id: string;
  account_id: string;
  transaction_name: string;
  transaction_type: "income" | "expense";
  description: string | null;
  amount: number;
  duration_type: "one_time" | "recurring" | null; // ex: 'indefinite', 'fixed'
  start_date: string; // DATE
  recurrence_rule?: RecurrenceRule | null; // Règle de récurrence associée à la transaction
};

type RecurrenceRule = {
  id: string;
  transaction_id: string;
  interval_unit: "day" | "month" | "year";
  interval_count: number;
  start_date: string; // DATE
  end_date?: string | null; // DATE
};  

type Account = {
  id: string;
  user_id: string;
  account_name: string;
  description: string | null;
  created_on: string; // DATE
  currency: string; // CHAR(3)
  balance: number; // NUMERIC(18,2)
  annual_interest_rate: number | null; // NUMERIC(6,4)
  tax_rate: number | null; // NUMERIC(6,4)
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
};

type Occurrence = {
  date: Date;
  amount: number;
  type: "income" | "expense";
  name?: string; // Nom de la transaction associée
};

type MonthlyDetail = {
  month: Date;
  income: number;
  expense: number;
  interest: number;
  balance: number;
};

type ForecastResult = {
  account_id: string;
  account_name: string;
  starting_balance: number;
  forecasted_balance: number;
  monthly_details: MonthlyDetail[];
};

type forecast = {
  calculateAccountForecast: (account: Account, transactions: Transaction[], targetDate: string) => ForecastResult;
  getRecurringOccurrences: (transaction: Transaction, recurrenceRule: RecurrenceRule, targetDate: string) => Occurrence[];
};

type ForecastQuery = {
  target_date?: string;
};
  

/**
 * Calcule les occurrences d'une transaction récurrente jusqu'à une date cible
 */
function getRecurringOccurrences(transaction: Transaction, recurrenceRule: RecurrenceRule, targetDate: string ): Occurrence[] {
  const occurrences: Occurrence[] = [];
  const startDate: Date = new Date(transaction.start_date);
  const target: Date = new Date(targetDate);
  const endDate: Date | null = recurrenceRule.end_date ? new Date(recurrenceRule.end_date) : null;

  if (target < startDate) return occurrences;

  let currentDate = new Date(startDate);
  const intervalUnit: "day" | "month" | "year" = recurrenceRule.interval_unit;
  const intervalCount: number = recurrenceRule.interval_count;

  while (currentDate <= target) {
    if (endDate && currentDate > endDate) break;

    occurrences.push({
      date: new Date(currentDate),
      amount: Number(transaction.amount),
      type: transaction.transaction_type
    });

    // Calculer la prochaine occurrence
    if (intervalUnit === 'day') {
      currentDate.setDate(currentDate.getDate() + intervalCount);
    } else if (intervalUnit === 'month') {
      currentDate.setMonth(currentDate.getMonth() + intervalCount);
    } else if (intervalUnit === 'year') {
      currentDate.setFullYear(currentDate.getFullYear() + intervalCount);
    }
  }

  return occurrences;
}

/**
 * Calcule le solde prévisionnel d'un compte à une date donnée
 */
function calculateAccountForecast(account: Account, transactions: Transaction[], targetDate: string): ForecastResult {
  const startDate: Date = new Date();
  const target: Date = new Date(targetDate);
  let balance: number = Number(account.balance || 0);
  const annualRate: number = Number(account.annual_interest_rate || 0) / 100;
  const taxRate: number = Number(account.tax_rate || 0) / 100;
  const monthlyRate: number = annualRate / 12;

  // Récupérer toutes les occurrences de transactions jusqu'à la date cible
  const allOccurrences: Occurrence[] = [];

  for (const transaction of transactions) {
    // Transaction récurrente : calculer toutes les occurrences
    if (transaction.duration_type === 'recurring' && transaction.recurrence_rule) {
      const occurrences: Occurrence[] = getRecurringOccurrences(
        transaction,
        transaction.recurrence_rule,
        targetDate
      );
      occurrences.forEach(occ => {
        occ.name = transaction.transaction_name;
      });
      allOccurrences.push(...occurrences);
    } else {
      // Transaction ponctuelle (one_time ou null) : une seule occurrence
      const transDate: Date = new Date(transaction.start_date);
      if (transDate <= target) {
        allOccurrences.push({
          date: transDate,
          amount: Number(transaction.amount),
          type: transaction.transaction_type,
          name: transaction.transaction_name
        });
      }
    }
  }

  // Trier les occurrences par date
  allOccurrences.sort((a: Occurrence, b: Occurrence): number => a.date.getTime() - b.date.getTime());

  // Simuler mois par mois jusqu'à la date cible
  const monthlyDetails: MonthlyDetail[] = [];
  let currentMonth: Date = new Date(startDate);
  currentMonth.setDate(1); // Premier jour du mois
  currentMonth.setHours(0, 0, 0, 0);

  while (currentMonth <= target) {
    const monthStart: Date = new Date(currentMonth);
    const monthEnd: Date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const monthEndDate: Date = monthEnd > target ? target : monthEnd;

    let monthIncome: number = 0;
    let monthExpense: number = 0;

    // Calculer les transactions de ce mois
    for (const occ of allOccurrences) {
      const occDate: Date = new Date(occ.date);
      occDate.setHours(0, 0, 0, 0);
      if (occDate >= monthStart && occDate <= monthEndDate) {
        if (occ.type === 'income') {
          monthIncome += occ.amount;
        } else {
          monthExpense += occ.amount;
        }
      }
    }

    // Appliquer les transactions du mois
    balance += monthIncome - monthExpense;

    // Calculer les intérêts du mois (sur le solde après les transactions)
    const grossInterest: number = balance * monthlyRate;
    const netInterest: number = grossInterest * (1 - taxRate);
    const monthInterest: number = netInterest;

    // Appliquer les intérêts
    balance += monthInterest;

    monthlyDetails.push({
      month: new Date(currentMonth),
      income: monthIncome,
      expense: monthExpense,
      interest: monthInterest,
      balance: Number(balance.toFixed(2))
    });

    // Passer au mois suivant
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }

  return {
    account_id: account.id,
    account_name: account.account_name,
    starting_balance: Number(account.balance || 0),
    forecasted_balance: Number(balance.toFixed(2)),
    monthly_details: monthlyDetails
  };
}

/**
 * GET /api/previsions?target_date=2025-12-31
 * Calcule les prévisions financières jusqu'à la date cible
 */
router.get("/", requireAuth, async (req: Request<{}, {}, {}, ForecastQuery>, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Utilisateur non authentifié" });
  }
  try {
    const userId: string = req.user.id;
    const targetDate: string = req.query.target_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 1 an par défaut

    // Récupérer tous les comptes de l'utilisateur
    const { rows: accounts } = await db.query(
      `SELECT * FROM accounts WHERE user_id = $1 ORDER BY account_name`,
      [userId]
    );

    const forecasts = [];

    for (const account of accounts) {
      // Récupérer toutes les transactions du compte (revenus et dépenses) avec leurs règles de récurrence
      const { rows: transactions } = await db.query(
        `SELECT 
          t.*,
          CASE 
            WHEN r.id IS NOT NULL THEN
              json_build_object(
                'id', r.id,
                'interval_unit', r.interval_unit,
                'interval_count', r.interval_count,
                'start_date', r.start_date,
                'end_date', r.end_date
              )
            ELSE NULL
          END as recurrence_rule
        FROM transactions t
        LEFT JOIN recurrence_rules r ON r.transaction_id = t.id
        WHERE t.account_id = $1
        ORDER BY t.start_date`,
        [account.id]
      );

      const forecast: ForecastResult = calculateAccountForecast(account, transactions, targetDate);
      forecasts.push(forecast);
    }

    // Calculer le total global
    const totalStarting: number = forecasts.reduce((sum, f) => sum + f.starting_balance, 0);
    const totalForecasted: number = forecasts.reduce((sum, f) => sum + f.forecasted_balance, 0);

    res.json({
      target_date: targetDate,
      accounts: forecasts,
      total_starting_balance: Number(totalStarting.toFixed(2)),
      total_forecasted_balance: Number(totalForecasted.toFixed(2))
    });
  } catch (err) {
    console.error("GET /previsions error", err);
    res.status(500).json({
      error: "Erreur lors du calcul des prévisions.",
    });
  }
});

export default router;

