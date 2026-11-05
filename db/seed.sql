-- Données de test 

-- Utilisateurs
INSERT INTO users (first_name, last_name, email, password_hash)
VALUES
('Alice', 'Dupont', 'alice.dupont@example.com', 'hashed_password1'),
('Bob', 'Martin', 'bob.martin@example.com', 'hashed_password2'),
('Charlie', 'Durand', 'charlie.durand@example.com', 'hashed_password3');

-- Comptes bancaires (ajout de created_on obligatoire)
INSERT INTO accounts (user_id, account_name, description, currency, balance, annual_interest_rate, tax_rate, created_on)
SELECT u.id, a.account_name, a.description, a.currency, a.balance, a.annual_interest_rate, a.tax_rate, CURRENT_DATE
FROM users u
CROSS JOIN (
  VALUES
    ('Compte courant', 'Compte principal', 'EUR', 1000.00, 0.01, 0.20),
    ('Compte épargne', 'Épargne personnelle', 'EUR', 5000.00, 0.025, 0.15)
) AS a(account_name, description, currency, balance, annual_interest_rate, tax_rate);

-- Transactions
INSERT INTO transactions (account_id, transaction_name, transaction_type, description, amount, duration_type, start_date)
SELECT a.id, 'Salaire', 'income', 'Salaire mensuel', 2500.00, 'recurring', CURRENT_DATE - INTERVAL '1 month'
FROM accounts a
WHERE a.account_name = 'Compte courant'
UNION ALL
SELECT a.id, 'Loyer', 'expense', 'Loyer appartement', 800.00, 'recurring', CURRENT_DATE - INTERVAL '1 month'
FROM accounts a
WHERE a.account_name = 'Compte courant';

-- Règles de récurrence
INSERT INTO recurrence_rules (transaction_id, interval_unit, interval_count, start_date)
SELECT t.id, 'month', 1, t.start_date
FROM transactions t
WHERE t.transaction_name IN ('Salaire', 'Loyer');

-- 7Exceptions de transaction
INSERT INTO transaction_exceptions (transaction_id, exception_name, description, started_at, ends_at, override_amount)
SELECT t.id, 'Bonus', 'Prime exceptionnelle', NOW() - INTERVAL '5 days', NOW() + INTERVAL '5 days', 500.00
FROM transactions t
WHERE t.transaction_name = 'Salaire';