-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- Utilisateurs
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_admin BOOLEAN NOT NULL DEFAULT false,
  cash NUMERIC(24,10) NOT NULL DEFAULT 10000 -- solde de départ pour la simulation
  updated_at TIMESTAMPTZ DEFAULT NOW()


);

-- Actifs supportés
CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  symbol TEXT UNIQUE NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('crypto','forex','index'))
);


-- Stratégies configurées par l’utilisateur
CREATE TABLE strategy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('RSI','MA_CROSS')),
  params JSONB NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  updated_at TIMESTAMPTZ DEFAULT NOW() 
);


-- Signaux générés par une stratégie

-- Signaux & exécutions liées à une stratégie

CREATE TABLE strategy_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
  asset_id INT NOT NULL REFERENCES assets(id),
  action TEXT NOT NULL CHECK (action IN ('BUY','SELL','HOLD')),
  indicators JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transactions (trades simulés)
CREATE TABLE trade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL,
  asset_id INT NOT NULL REFERENCES assets(id),
  side TEXT NOT NULL CHECK (side IN ('BUY','SELL')),
  quantity NUMERIC(24,10) NOT NULL CHECK (quantity > 0),
  price_open NUMERIC(18,8) NOT NULL CHECK (price_open > 0),
  price_close NUMERIC(18,8) NULL CHECK (price_close > 0),
  pnl NUMERIC(24,10),
  executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  close_at TIMESTAMPTZ NULL
);


-- Positions (portefeuille de l’utilisateur)

CREATE TABLE positions (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_id INT NOT NULL REFERENCES assets(id),
  quantity NUMERIC(24,10) NOT NULL DEFAULT 0,
  avg_price NUMERIC(18,8) NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, asset_id)
);


-- Cache news (optionnel MVP)

CREATE TABLE news (
  id BIGSERIAL PRIMARY KEY,
  source TEXT,
  title TEXT,
  url TEXT,
  published_at TIMESTAMPTZ,
  symbols TEXT[]
);
