-- ------------------------------
-- Insère des données de test 
-- ------------------------------

-- 1️⃣ Utilisateurs
INSERT INTO users (first_name, last_name, email, password_hash)
VALUES
('Alice', 'Dupont', 'alice.dupont@example.com', 'hashed_password1'),
('Bob', 'Martin', 'bob.martin@example.com', 'hashed_password2'),
('Charlie', 'Durand', 'charlie.durand@example.com', 'hashed_password3');

-- 2️⃣ Plans d'abonnement
INSERT INTO plans (plan_name, max_accounts, max_expenses_per_account, max_incomes_per_account, price)
VALUES
('Basic', 1, 50, 50, 9.99),
('Standard', 3, 200, 200, 19.99),
('Premium', 10, 1000, 1000, 49.99);

-- 3️⃣ Abonnements (1 abonnement Standard par utilisateur)
INSERT INTO subscriptions (user_id, plan_id, status, started_at, ends_at, stripe_customer_id, stripe_subscription_id)
SELECT u.id, p.id, 'active', NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days',
       'cus_test_' || ROW_NUMBER() OVER (), 'sub_test_' || ROW_NUMBER() OVER ()
FROM users u
JOIN plans p ON p.plan_name = 'Standard';

-- 4️⃣ Comptes bancaires (ajout de created_on obligatoire)
INSERT INTO accounts (user_id, account_name, description, currency, balance, annual_interest_rate, tax_rate, created_on)
SELECT u.id, a.account_name, a.description, a.currency, a.balance, a.annual_interest_rate, a.tax_rate, CURRENT_DATE
FROM users u
CROSS JOIN (
  VALUES
    ('Compte courant', 'Compte principal', 'EUR', 1000.00, 0.01, 0.20),
    ('Compte épargne', 'Épargne personnelle', 'EUR', 5000.00, 0.025, 0.15)
) AS a(account_name, description, currency, balance, annual_interest_rate, tax_rate);

-- 5️⃣ Transactions
INSERT INTO transactions (account_id, transaction_name, transaction_type, description, amount, duration_type, start_date)
SELECT a.id, 'Salaire', 'income', 'Salaire mensuel', 2500.00, 'recurring', CURRENT_DATE - INTERVAL '1 month'
FROM accounts a
WHERE a.account_name = 'Compte courant'
UNION ALL
SELECT a.id, 'Loyer', 'expense', 'Loyer appartement', 800.00, 'recurring', CURRENT_DATE - INTERVAL '1 month'
FROM accounts a
WHERE a.account_name = 'Compte courant';

-- 6️⃣ Règles de récurrence
INSERT INTO recurrence_rules (transaction_id, interval_unit, interval_count, start_date)
SELECT t.id, 'month', 1, t.start_date
FROM transactions t
WHERE t.transaction_name IN ('Salaire', 'Loyer');

-- 7️⃣ Exceptions de transaction
INSERT INTO transaction_exceptions (transaction_id, exception_name, description, started_at, ends_at, override_amount)
SELECT t.id, 'Bonus', 'Prime exceptionnelle', NOW() - INTERVAL '5 days', NOW() + INTERVAL '5 days', 500.00
FROM transactions t
WHERE t.transaction_name = 'Salaire';