-- Migration: Add Portfolio Tracking System
-- Date: 2025-01-16
-- Description: Ajoute le système de suivi de portfolio avec snapshots, améliore users et trade

-- ============================================================================
-- 1. AMÉLIORER LA TABLE USERS
-- ============================================================================

-- Ajouter les colonnes manquantes à la table users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS initial_balance NUMERIC(24,10) DEFAULT 10000,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS password_reset_token TEXT,
  ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'fr',
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Mettre à jour initial_balance pour les utilisateurs existants (si NULL)
UPDATE users SET initial_balance = cash WHERE initial_balance IS NULL;

-- ============================================================================
-- 2. AMÉLIORER LA TABLE TRADES
-- ============================================================================

-- Ajouter des colonnes utiles pour le tracking des trades
ALTER TABLE trades
  ADD COLUMN IF NOT EXISTS fees NUMERIC(18,8) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[],
  ADD COLUMN IF NOT EXISTS profit_percent NUMERIC(10,4);

-- ============================================================================
-- 3. CRÉER LA TABLE PORTFOLIO_SNAPSHOTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Valeurs du portefeuille
  cash NUMERIC(24,10) NOT NULL,
  equity NUMERIC(24,10) NOT NULL,  -- valeur actuelle des positions
  total_value NUMERIC(24,10) NOT NULL,  -- cash + equity

  -- P&L (Profit & Loss)
  realized_pnl NUMERIC(24,10) DEFAULT 0,  -- gains/pertes des trades fermés
  unrealized_pnl NUMERIC(24,10) DEFAULT 0,  -- gains/pertes des positions ouvertes
  total_pnl NUMERIC(24,10) DEFAULT 0,  -- realized + unrealized
  daily_pnl NUMERIC(24,10) DEFAULT 0,  -- variation vs jour précédent
  daily_pnl_percent NUMERIC(10,4) DEFAULT 0,  -- variation % vs jour précédent

  -- Métriques de performance
  total_return_percent NUMERIC(10,4),  -- rendement total depuis le début
  win_rate NUMERIC(10,4),  -- % de trades gagnants
  total_trades INTEGER DEFAULT 0,  -- nombre total de trades
  winning_trades INTEGER DEFAULT 0,  -- nombre de trades gagnants

  -- Métriques de risque
  max_drawdown NUMERIC(10,4),  -- perte max depuis le pic historique
  sharpe_ratio NUMERIC(10,4),  -- rendement ajusté au risque

  -- Timestamp
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, snapshot_date)
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_snapshots_user_date ON portfolio_snapshots(user_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_snapshots_date ON portfolio_snapshots(snapshot_date DESC);

-- ============================================================================
-- 4. CRÉER LA TABLE POSITION_HISTORY (Optionnel mais utile)
-- ============================================================================

CREATE TABLE IF NOT EXISTS position_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_id INT NOT NULL REFERENCES assets(id),

  -- État de la position à ce moment
  quantity NUMERIC(24,10) NOT NULL,
  avg_price NUMERIC(18,8) NOT NULL,
  current_price NUMERIC(18,8) NOT NULL,
  market_value NUMERIC(24,10) NOT NULL,  -- quantity * current_price
  unrealized_pnl NUMERIC(24,10) NOT NULL,  -- (current_price - avg_price) * quantity
  unrealized_pnl_percent NUMERIC(10,4),  -- % de gain/perte

  -- Timestamp
  snapshot_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, asset_id, snapshot_date)
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_position_history_user_date ON position_history(user_id, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_position_history_asset ON position_history(asset_id, snapshot_date DESC);

-- ============================================================================
-- 5. FONCTION UTILITAIRE: Calculer le snapshot du jour pour un utilisateur
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_portfolio_snapshot(p_user_id UUID, p_snapshot_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  cash NUMERIC,
  equity NUMERIC,
  total_value NUMERIC,
  realized_pnl NUMERIC,
  unrealized_pnl NUMERIC,
  total_pnl NUMERIC
) AS $$
DECLARE
  v_cash NUMERIC;
  v_equity NUMERIC;
  v_realized_pnl NUMERIC;
  v_unrealized_pnl NUMERIC;
BEGIN
  -- Récupérer le cash de l'utilisateur
  SELECT u.cash INTO v_cash
  FROM users u
  WHERE u.id = p_user_id;

  -- Calculer l'equity (valeur des positions ouvertes)
  -- Note: il faudrait les prix actuels des assets, ici on utilise avg_price comme approximation
  SELECT COALESCE(SUM(p.quantity * p.avg_price), 0) INTO v_equity
  FROM positions p
  WHERE p.user_id = p_user_id AND p.quantity > 0;

  -- Calculer le PnL réalisé (trades fermés)
  SELECT COALESCE(SUM(t.pnl), 0) INTO v_realized_pnl
  FROM trades t
  WHERE t.user_id = p_user_id AND t.closed_at IS NOT NULL;

  -- Calculer le PnL non réalisé (positions ouvertes)
  -- Approximation: différence entre valeur actuelle et coût
  SELECT COALESCE(SUM((p.avg_price - p.avg_price) * p.quantity), 0) INTO v_unrealized_pnl
  FROM positions p
  WHERE p.user_id = p_user_id AND p.quantity > 0;

  RETURN QUERY SELECT
    v_cash,
    v_equity,
    v_cash + v_equity,
    v_realized_pnl,
    v_unrealized_pnl,
    v_realized_pnl + v_unrealized_pnl;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTAIRES SUR LES TABLES
-- ============================================================================

COMMENT ON TABLE portfolio_snapshots IS 'Historique quotidien de la valeur du portfolio de chaque utilisateur';
COMMENT ON TABLE position_history IS 'Historique quotidien de chaque position individuelle';
COMMENT ON COLUMN portfolio_snapshots.equity IS 'Valeur totale des positions ouvertes (en USD ou devise de base)';
COMMENT ON COLUMN portfolio_snapshots.max_drawdown IS 'Perte maximale depuis le pic historique (en %)';
COMMENT ON COLUMN portfolio_snapshots.sharpe_ratio IS 'Ratio de Sharpe - mesure le rendement ajusté au risque';

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
