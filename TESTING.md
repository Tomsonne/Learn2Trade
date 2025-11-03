# Guide de Tests - Learn2Trade

Ce document explique comment exécuter les tests pour le projet Learn2Trade.

## Tests Backend (Jest)

### Structure des Tests

```
backend/test/
├── auth.service.test.js       # Tests unitaires authentification
├── user.service.test.js        # Tests unitaires utilisateurs
├── trade.service.test.js       # Tests unitaires trades (NOUVEAU)
├── auth.api.test.js            # Tests d'intégration API auth (NOUVEAU)
├── jest.setup.js               # Configuration Jest
└── test_db.js                  # Test de connexion DB
```

### Exécuter les Tests Backend

```bash
cd backend

# Tous les tests
npm test

# Tests en mode watch
npm test -- --watch

# Tests avec couverture
npm test -- --coverage

# Un fichier spécifique
npm test trade.service.test.js
```

### Tests Implémentés

#### 1. Trade Service Tests (`trade.service.test.js`)
Tests des opérations financières critiques :
- **openTrade**
  - Ouverture de trade BUY avec réduction du cash
  - Rejet si solde insuffisant
  - Validation des quantités (négatives, nulles)
  - Validation du side (BUY/SELL)
  - Gestion erreurs (user/asset introuvable)

- **closeTrade**
  - Fermeture totale avec calcul PnL (profit)
  - Fermeture partielle avec quantité restante
  - Calcul PnL pour SELL avec perte
  - Rejet si trade déjà fermé
  - Rejet si quantité excessive

- **getTradesByUser**
  - Récupération de tous les trades
  - Filtrage par is_closed
  - Filtrage par asset_id
  - Calcul du pnl_pct
  - Validation userId requis

**Couverture : ~90%** des cas d'usage critiques

#### 2. Auth API Tests (`auth.api.test.js`)
Tests d'intégration des endpoints :
- **POST /api/v1/auth/signup**
  - Création utilisateur (201)
  - Rejet email/password manquant (400)
  - Rejet email dupliqué (400)

- **POST /api/v1/auth/login**
  - Login avec cookie JWT httpOnly
  - Rejet credentials invalides (401)
  - Rejet email inexistant (401)

- **GET /api/v1/auth/check**
  - Vérification token valide
  - Rejet sans token (401)
  - Rejet token expiré (401)

- **POST /api/v1/auth/logout**
  - Suppression cookie

- **GET /api/v1/auth/me**
  - Récupération user authentifié
  - Protection authentification requise

- **Tests de sécurité**
  - Pas de fuite de données sensibles
  - Cookies httpOnly
  - Messages d'erreur génériques

**Couverture : ~85%** des routes auth

#### 3. Auth Service Tests (`auth.service.test.js`)
Tests unitaires existants :
- signup (création user, hash password, JWT)
- login (vérification credentials, JWT)
- Gestion erreurs (email dupliqué, credentials invalides)

#### 4. User Service Tests (`user.service.test.js`)
Tests unitaires existants :
- getUserById
- Gestion erreurs

## Tests Frontend (Vitest)

### Structure des Tests

```
frontend/src/
├── hooks/__tests__/
│   └── useMarketSeries.test.js  # Tests du hook critique (NOUVEAU)
├── test/
│   └── setup.js                 # Configuration Vitest
└── vitest.config.js             # Config globale
```

### Exécuter les Tests Frontend

```bash
cd frontend

# Tous les tests
npm test

# Mode watch (re-run automatique)
npm test

# UI interactive
npm run test:ui

# Avec couverture
npm run test:coverage
```

### Tests Implémentés

#### useMarketSeries Hook Tests (`useMarketSeries.test.js`)
Tests du hook React critique pour les données de marché :
- **Chargement de données**
  - Récupération OHLC avec indicateurs (SMA20, SMA50, RSI)
  - Structure des données correcte
  - Indicateurs null pour bougies précoces
  - Indicateurs calculés pour bougies tardives

- **Gestion des erreurs**
  - Erreurs réseau
  - Réponses API avec erreur
  - Données vides

- **Fonctionnalités**
  - Override last candle avec spotPrice
  - Limite correcte par timeframe (1d=200, autres=500)
  - Endpoint et paramètres corrects
  - Rechargement sur changement de dépendances

- **Polling**
  - Polling avec refreshMs actif
  - Pas de polling si refreshMs=0

- **Validations**
  - RSI entre 0-100
  - SMA correctes (prix constants)
  - Valeurs par défaut (symbol=BTC, tf=1h)

**Couverture : ~95%** du hook

## Configuration

### Backend - Jest

Fichier : `backend/jest.config.js`
```javascript
export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/test/**/*.test.js'],
  collectCoverageFrom: ['app/**/*.js'],
  coveragePathIgnorePatterns: ['/node_modules/', '/test/']
};
```

### Frontend - Vitest

Fichier : `frontend/vitest.config.js`
```javascript
export default {
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
};
```

## Bonnes Pratiques

### 1. Tests Unitaires
- Mocker les dépendances externes (DB, APIs)
- Tester un seul comportement par test
- Nommer clairement : `should [action] when [condition]`
- Utiliser beforeEach pour cleanup

### 2. Tests d'Intégration
- Tester les flows complets (signup → login → protected route)
- Vérifier les codes HTTP
- Vérifier les cookies/headers
- Tester les cas d'erreur

### 3. Coverage
**Objectifs de couverture :**
- Services financiers : 90%+
- Authentification : 80%+
- API endpoints : 70%+
- Composants React : 60%+

## Tests Manquants (Recommandés)

### Backend
- [ ] `position.api.test.js` - Tests endpoints positions
- [ ] `market.api.test.js` - Tests endpoints market data
- [ ] `trade.api.test.js` - Tests endpoints trades
- [ ] `models.test.js` - Tests validations Sequelize

### Frontend
- [ ] `Header.test.jsx` - Tests composant Header
- [ ] `PositionCard.test.jsx` - Tests affichage positions
- [ ] `TradeHistory.test.jsx` - Tests historique
- [ ] `Login.test.jsx` - Tests page login
- [ ] `Dashboard.test.jsx` - Tests page dashboard

## CI/CD (Future)

Exemple GitHub Actions :
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- --coverage
```

## Debugging Tests

### Backend
```bash
# Mode verbose
npm test -- --verbose

# Debug avec breakpoint
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Frontend
```bash
# UI interactive
npm run test:ui

# Watch avec logs
npm test -- --reporter=verbose
```

## Ressources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest](https://github.com/visionmedia/supertest)
