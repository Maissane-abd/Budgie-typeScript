-- db/init.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des Utilisateurs
CREATE TABLE users ( 
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des Plans d'abonnement
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_name VARCHAR(100) NOT NULL,
  max_accounts INT DEFAULT 1,
  max_expenses_per_account INT,
  max_incomes_per_account INT,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des Abonnements
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  status VARCHAR(50) NOT NULL CHECK (status IN ('active','canceled','trial')),
  started_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des Comptes Bancaires
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_on DATE NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'EUR',
  balance NUMERIC(18,2) DEFAULT 0,
  annual_interest_rate NUMERIC(6,4), -- ex: 0.0250 = 2.5%
  tax_rate NUMERIC(6,4),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index séparé
CREATE INDEX IF NOT EXISTS idx_accounts_user
ON accounts(user_id);

-- Table des Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  transaction_name VARCHAR(150) NOT NULL,
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('income','expense')),
  description TEXT,
  amount NUMERIC(18,2) NOT NULL,
  duration_type VARCHAR(50), -- ex: 'indefinite', 'fixed'
  start_date DATE NOT NULL,
  -- end_date DATE,
  -- recurring_rule_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des Règles de Récurrence
CREATE TABLE recurrence_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  interval_unit VARCHAR(20) NOT NULL CHECK (interval_unit IN ('day','month','year')),
  interval_count INT NOT NULL DEFAULT 1,
  start_date DATE NOT NULL,
  end_date DATE
);

-- Table des Exceptions de Transaction
CREATE TABLE transaction_exceptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  exception_name VARCHAR(150),
  description TEXT,
  started_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  override_amount NUMERIC(18,2),
  override_duration_type VARCHAR(50),
  override_n_months INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour optimiser les requêtes sur les transactions par compte et date de début
CREATE INDEX idx_transactions_account_start ON transactions(account_id, start_date);

-- Index pour optimiser les requêtes sur les revenus par compte
CREATE INDEX IF NOT EXISTS idx_transactions_income_account
ON transactions(transaction_type, account_id);
