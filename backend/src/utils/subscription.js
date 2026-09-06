// utils/subscription.js
import db from '../models/db.js';

/**
 * Récupère le plan actif de l'utilisateur et ses limites
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object|null>} Plan avec limites ou null si pas d'abonnement actif
 */
export async function getUserPlan(userId) {
    try {
        const { rows } = await db.query(
            `SELECT 
        p.plan_name,
        p.max_accounts,
        p.max_expenses_per_account,
        p.max_incomes_per_account
       FROM subscriptions s
       JOIN plans p ON p.id = s.plan_id
       WHERE s.user_id = $1 
       AND s.status = 'active'
       AND (s.ends_at IS NULL OR s.ends_at > NOW())
       ORDER BY s.started_at DESC
       LIMIT 1`,
            [userId]
        );

        if (rows.length === 0) {
            // Plan gratuit (pas d'abonnement actif)
            return {
                plan_name: 'Gratuit',
                max_accounts: 2,
                max_expenses_per_account: 7,
                max_incomes_per_account: 2
            };
        }

        return rows[0];
    } catch (error) {
        console.error('Erreur lors de la récupération du plan utilisateur:', error);
        // En cas d'erreur, retourner le plan gratuit par défaut
        return {
            plan_name: 'Gratuit',
            max_accounts: 2,
            max_expenses_per_account: 7,
            max_incomes_per_account: 2
        };
    }
}

/**
 * Vérifie si l'utilisateur a atteint la limite de dépenses pour un compte
 * @param {string} userId - ID de l'utilisateur
 * @param {string} accountId - ID du compte
 * @returns {Promise<Object>} { limitReached: boolean, currentCount: number, maxCount: number|null }
 */
export async function checkExpenseLimit(userId, accountId) {
    const plan = await getUserPlan(userId);

    // Si Premium ou limite null/undefined, pas de limite
    if (plan.plan_name === 'Premium' || !plan.max_expenses_per_account) {
        return { limitReached: false, currentCount: 0, maxCount: null };
    }

    // Compter les dépenses pour ce compte
    const { rows } = await db.query(
        `SELECT COUNT(*) as count 
     FROM transactions t
     JOIN accounts a ON a.id = t.account_id
     WHERE t.account_id = $1 
     AND t.transaction_type = 'expense'
     AND a.user_id = $2`,
        [accountId, userId]
    );

    const currentCount = parseInt(rows[0].count, 10);
    const maxCount = plan.max_expenses_per_account;

    return {
        limitReached: currentCount >= maxCount,
        currentCount,
        maxCount
    };
}

/**
 * Vérifie si l'utilisateur a atteint la limite de revenus pour un compte
 * @param {string} userId - ID de l'utilisateur
 * @param {string} accountId - ID du compte
 * @returns {Promise<Object>} { limitReached: boolean, currentCount: number, maxCount: number|null }
 */
export async function checkIncomeLimit(userId, accountId) {
    const plan = await getUserPlan(userId);

    // Si Premium ou limite null/undefined, pas de limite
    if (plan.plan_name === 'Premium' || !plan.max_incomes_per_account) {
        return { limitReached: false, currentCount: 0, maxCount: null };
    }

    // Compter les revenus pour ce compte
    const { rows } = await db.query(
        `SELECT COUNT(*) as count 
     FROM transactions t
     JOIN accounts a ON a.id = t.account_id
     WHERE t.account_id = $1 
     AND t.transaction_type = 'income'
     AND a.user_id = $2`,
        [accountId, userId]
    );

    const currentCount = parseInt(rows[0].count, 10);
    const maxCount = plan.max_incomes_per_account;

    return {
        limitReached: currentCount >= maxCount,
        currentCount,
        maxCount
    };
}
