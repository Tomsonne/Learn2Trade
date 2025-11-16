# 📊 Système de Suivi de Portfolio

Ce document décrit le nouveau système de suivi de portfolio avec snapshots quotidiens.

## 🎯 Vue d'ensemble

Le système capture automatiquement l'état du portfolio de chaque utilisateur quotidiennement pour permettre:
- 📈 Graphiques d'évolution du portfolio dans le temps
- 📊 Métriques de performance (ROI, win rate, drawdown)
- 🔍 Analyse historique des positions
- 📉 Calcul du Sharpe ratio et autres métriques avancées

## 🗄️ Tables de Base de Données

### `portfolio_snapshots`
Historique quotidien de la valeur totale du portfolio.

**Colonnes principales:**
- `cash` - Solde en cash
- `equity` - Valeur des positions ouvertes
- `total_value` - Valeur totale (cash + equity)
- `total_pnl` - Profit/Loss total
- `daily_pnl` - Variation quotidienne
- `win_rate` - % de trades gagnants
- `max_drawdown` - Perte maximale depuis le pic

### `position_history`
Historique quotidien de chaque position individuelle.

**Colonnes principales:**
- `asset_id` - L'actif (crypto, forex, etc.)
- `quantity` - Quantité détenue
- `avg_price` - Prix moyen d'achat
- `current_price` - Prix du marché
- `unrealized_pnl` - Gain/perte non réalisé

## 🚀 Utilisation

### 1. Migration de la Base de Données

```bash
# Exécuter la migration (une seule fois)
cd backend
node db/migrate.js --yes
```

Cela va:
- ✅ Ajouter de nouvelles colonnes à `users` (username, email_verified, etc.)
- ✅ Ajouter de nouvelles colonnes à `trades` (fees, notes, tags)
- ✅ Créer la table `portfolio_snapshots`
- ✅ Créer la table `position_history`

### 2. Cron Job Automatique

Le cron job s'exécute **automatiquement tous les jours à 23:59** et crée un snapshot pour tous les utilisateurs actifs.

**Configuration:**
- Fichier: `backend/app/jobs/snapshot.cron.js`
- Planification: `59 23 * * *` (23:59 chaque jour)
- Timezone: `Europe/Paris` (modifiable)

**Pour créer un snapshot au démarrage (dev):**
```bash
# Dans .env
CREATE_SNAPSHOT_ON_START=true
```

### 3. API Endpoints

#### Récupérer l'historique de snapshots
```http
GET /api/v1/snapshots/history?days=30
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "snapshot_date": "2025-01-16",
      "total_value": "10500.50",
      "total_pnl": "500.50",
      "daily_pnl": "50.25",
      "win_rate": "65.5",
      "max_drawdown": "5.2"
    }
  ]
}
```

#### Créer un snapshot manuel
```http
POST /api/v1/snapshots/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2025-01-16"  // optionnel
}
```

#### Obtenir les métriques actuelles (sans créer de snapshot)
```http
GET /api/v1/snapshots/metrics
Authorization: Bearer <token>
```

#### [ADMIN] Créer des snapshots pour tous les utilisateurs
```http
POST /api/v1/snapshots/admin/create-all
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "date": "2025-01-16"  // optionnel
}
```

## 📝 Utilisation dans le Code

### Service de Snapshot

```javascript
import {
  createPortfolioSnapshot,
  getSnapshotHistory,
  calculatePortfolioMetrics
} from './services/snapshot.service.js';

// Créer un snapshot pour un utilisateur
const snapshot = await createPortfolioSnapshot(userId);

// Récupérer l'historique (30 derniers jours)
const history = await getSnapshotHistory(userId, 30);

// Calculer les métriques actuelles
const metrics = await calculatePortfolioMetrics(userId);
```

### Frontend - Utilisation dans React

```javascript
// Récupérer l'historique pour le graphique
const response = await fetch('/api/v1/snapshots/history?days=30', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data: snapshots } = await response.json();

// Utiliser dans le composant graphique
<PortfolioPerformanceChart snapshots={snapshots} />
```

## 🔧 Maintenance

### Vérifier les snapshots créés
```bash
# Via psql
psql "$DATABASE_URL" -c "SELECT user_id, snapshot_date, total_value FROM portfolio_snapshots ORDER BY snapshot_date DESC LIMIT 10;"
```

### Créer un snapshot manuellement (tous les users)
```bash
cd backend
node -e "
import { createAllSnapshots } from './app/services/snapshot.service.js';
await createAllSnapshots();
process.exit(0);
"
```

### Recalculer les snapshots historiques
Si vous avez des trades passés et voulez générer des snapshots rétroactifs:

```javascript
// Script personnalisé
import { createPortfolioSnapshot } from './services/snapshot.service.js';

const userId = 'user-uuid';
const startDate = new Date('2025-01-01');
const endDate = new Date();

for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
  await createPortfolioSnapshot(userId, new Date(d));
}
```

## 📊 Métriques Calculées

| Métrique | Description | Formule |
|----------|-------------|---------|
| **Total Value** | Valeur totale du portfolio | cash + equity |
| **Total PnL** | Profit/Loss total | realized_pnl + unrealized_pnl |
| **Daily PnL** | Variation vs veille | value_today - value_yesterday |
| **Win Rate** | % de trades gagnants | (winning_trades / total_trades) × 100 |
| **Max Drawdown** | Perte max depuis le pic | ((peak - current) / peak) × 100 |
| **Total Return %** | Rendement total | ((current - initial) / initial) × 100 |
| **Sharpe Ratio** | Rendement ajusté au risque | À implémenter |

## 🚨 Important

1. **Prix du marché**: Pour le MVP, on utilise `avg_price` comme approximation. Pour la production, intégrez une API de prix en temps réel.

2. **Performance**: Les snapshots sont créés une fois par jour. Pour des données intraday, utilisez l'endpoint `/metrics` qui calcule en temps réel.

3. **Timezone**: Le cron utilise `Europe/Paris` par défaut. Ajustez selon vos besoins dans `snapshot.cron.js`.

4. **Historique**: Les snapshots sont immuables (pas de `updated_at`). Ne les modifiez jamais après création.

## 🔮 Futures Améliorations

- [ ] Intégration API de prix en temps réel (CoinGecko, Alpha Vantage)
- [ ] Calcul du Sharpe ratio
- [ ] Snapshots intraday (toutes les heures)
- [ ] Alertes automatiques (drawdown > 10%, etc.)
- [ ] Export CSV des snapshots
- [ ] Comparaison avec benchmarks (S&P500, BTC)

## 📚 Références

- [Modèle PortfolioSnapshot](backend/app/models/portfolioSnapshot.model.js)
- [Service Snapshot](backend/app/services/snapshot.service.js)
- [Cron Job](backend/app/jobs/snapshot.cron.js)
- [Routes API](backend/app/api/snapshot.routes.js)
- [Migration SQL](backend/db/migrations/001_add_portfolio_tracking.sql)
