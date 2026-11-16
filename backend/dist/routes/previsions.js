import express from 'express';
import db from '../models/db.js';
import { requireAuth } from '../middlewares/index.js';
const router = express.Router();
// SQL DATE values are calendar dates, without a time or UTC offset.
export function calendarDate(value) {
    if (value instanceof Date) {
        return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    }
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);
    return new Date(year, month - 1, day);
}
// pull all occurrences of a recurring transaction up to a target date
function getRecurringOccurrences(transaction, recurrenceRule, targetDate) {
    const occurrences = [];
    const startDate = calendarDate(transaction.start_date);
    const target = calendarDate(targetDate);
    const endDate = recurrenceRule.end_date ? calendarDate(recurrenceRule.end_date) : null;
    if (target < startDate)
        return occurrences;
    const currentDate = new Date(startDate);
    const intervalUnit = recurrenceRule.interval_unit;
    const intervalCount = Number(recurrenceRule.interval_count);
    if (!Number.isInteger(intervalCount) || intervalCount <= 0)
        return occurrences;
    while (currentDate <= target) {
        if (endDate && currentDate > endDate)
            break;
        occurrences.push({
            date: new Date(currentDate),
            amount: Number(transaction.amount),
            type: transaction.transaction_type,
        });
        // Calculer la prochaine occurrence
        if (intervalUnit === 'day') {
            currentDate.setDate(currentDate.getDate() + intervalCount);
        }
        else if (intervalUnit === 'month') {
            currentDate.setMonth(currentDate.getMonth() + intervalCount);
        }
        else if (intervalUnit === 'year') {
            currentDate.setFullYear(currentDate.getFullYear() + intervalCount);
        }
    }
    return occurrences;
}
// Function to calculate the forecast for a given account up to a target date
export function calculateAccountForecast(account, transactions, targetDate) {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const target = calendarDate(targetDate);
    const occurrenceEndDate = new Date(Math.max(startDate.getTime(), target.getTime()));
    let balance = Number(account.balance || 0);
    const annualRate = Number(account.annual_interest_rate || 0) / 100;
    const taxRate = Number(account.tax_rate || 0) / 100;
    // Récupérer toutes les occurrences de transactions jusqu'à la date cible
    const allOccurrences = [];
    for (const transaction of transactions) {
        // Transaction récurrente : calculer toutes les occurrences
        if (transaction.duration_type === 'recurring' && transaction.recurrence_rule) {
            const occurrences = getRecurringOccurrences(transaction, transaction.recurrence_rule, `${occurrenceEndDate.getFullYear()}-${String(occurrenceEndDate.getMonth() + 1).padStart(2, '0')}-${String(occurrenceEndDate.getDate()).padStart(2, '0')}`);
            occurrences.forEach((occ) => {
                occ.name = transaction.transaction_name;
            });
            allOccurrences.push(...occurrences);
        }
        else {
            // Transaction ponctuelle (one_time ou null) : une seule occurrence
            const transDate = calendarDate(transaction.start_date);
            if (transDate <= occurrenceEndDate) {
                allOccurrences.push({
                    date: transDate,
                    amount: Number(transaction.amount),
                    type: transaction.transaction_type,
                    name: transaction.transaction_name,
                });
            }
        }
    }
    // Interest and its tax are applied once a year on the account anniversary.
    const opening = calendarDate(account.created_on);
    const interestDates = [];
    for (let year = opening.getFullYear() + 1; year <= occurrenceEndDate.getFullYear(); year++) {
        const day = Math.min(opening.getDate(), new Date(year, opening.getMonth() + 1, 0).getDate());
        const anniversary = new Date(year, opening.getMonth(), day);
        if (anniversary <= occurrenceEndDate)
            interestDates.push(anniversary);
    }
    const events = [
        ...allOccurrences.map(occ => ({ date: occ.date, amount: occ.type === 'income' ? occ.amount : -occ.amount, interest: false })),
        ...interestDates.map(date => ({ date, amount: 0, interest: true })),
    ].sort((a, b) => a.date.getTime() - b.date.getTime() || Number(a.interest) - Number(b.interest));
    let eventIndex = 0;
    const applyThrough = (date) => {
        let interest = 0;
        while (eventIndex < events.length && events[eventIndex].date <= date) {
            const event = events[eventIndex++];
            if (event.interest) {
                const net = Number((balance * annualRate * (1 - taxRate)).toFixed(2));
                balance += net;
                interest += net;
            }
            else {
                balance += event.amount;
            }
        }
        return interest;
    };
    applyThrough(startDate);
    const startingBalance = balance;
    const monthlyDetails = [];
    const currentMonth = new Date(startDate);
    currentMonth.setDate(1); // Premier jour du mois
    currentMonth.setHours(0, 0, 0, 0);
    while (currentMonth <= target) {
        const monthStart = new Date(currentMonth);
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        const monthEndDate = monthEnd > target ? target : monthEnd;
        let monthIncome = 0;
        let monthExpense = 0;
        // Calculer les transactions de ce mois
        for (const occ of allOccurrences) {
            const occDate = new Date(occ.date);
            occDate.setHours(0, 0, 0, 0);
            if (occDate > startDate && occDate >= monthStart && occDate <= monthEndDate) {
                if (occ.type === 'income') {
                    monthIncome += occ.amount;
                }
                else {
                    monthExpense += occ.amount;
                }
            }
        }
        const monthInterest = applyThrough(monthEndDate);
        monthlyDetails.push({
            month: new Date(currentMonth),
            income: monthIncome,
            expense: monthExpense,
            interest: monthInterest,
            balance: Number(balance.toFixed(2)),
        });
        // Passer au mois suivant
        currentMonth.setMonth(currentMonth.getMonth() + 1);
    }
    return {
        account_id: account.id,
        account_name: account.account_name,
        starting_balance: Number(startingBalance.toFixed(2)),
        forecasted_balance: Number(balance.toFixed(2)),
        monthly_details: monthlyDetails,
    };
}
// GET /previsions, returns the forecast for all accounts of the authenticated user up to a target date
router.get('/', requireAuth, async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }
    try {
        const userId = req.user.id;
        const targetDate = req.query.target_date ||
            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 1 an par défaut
        // Récupérer tous les comptes de l'utilisateur
        const { rows: accounts } = await db.query(`SELECT * FROM accounts WHERE user_id = $1 ORDER BY account_name`, [userId]);
        const forecasts = [];
        for (const account of accounts) {
            // Récupérer toutes les transactions du compte (revenus et dépenses) avec leurs règles de récurrence
            const { rows: transactions } = await db.query(`SELECT 
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
        ORDER BY t.start_date`, [account.id]);
            const forecast = calculateAccountForecast(account, transactions, targetDate);
            forecasts.push(forecast);
        }
        // Calculer le total global
        const totalStarting = forecasts.reduce((sum, f) => sum + f.starting_balance, 0);
        const totalForecasted = forecasts.reduce((sum, f) => sum + f.forecasted_balance, 0);
        res.json({
            target_date: targetDate,
            accounts: forecasts,
            total_starting_balance: Number(totalStarting.toFixed(2)),
            total_forecasted_balance: Number(totalForecasted.toFixed(2)),
        });
    }
    catch (err) {
        console.error('GET /previsions error', err);
        res.status(500).json({
            error: 'Erreur lors du calcul des prévisions.',
        });
    }
});
export default router;
