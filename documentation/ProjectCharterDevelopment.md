<p align="center">
  <img src="../images/Logo_L2T.png" alt="Logo" width="400"/>
</p>

# 📘 Project Charter – Learn2Trade
_
## 0. Project Objectives

**Purpose**  
Le projet Learn2Trade a pour but de rendre l’apprentissage du trading accessible aux débutants en proposant une plateforme simple, intuitive et sans risque financier. Il répond au manque d’outils pédagogiques ludiques qui combinent crypto et forex, simulation d’ordres et stratégies automatisées.


### 🎯 Objectifs SMART  

1. **Authentification sécurisée**  
- **Spécifique** : Mettre en place une authentification par email et mot de passe avec JWT et bcrypt.  
- **Mesurable** : 100% des utilisateurs créés doivent pouvoir se connecter et maintenir une session active.  
- **Atteignable** : Utilisation de bibliothèques standards (Flask-JWT-Extended, bcrypt).  
- **Réaliste** : Indispensable pour la gestion des comptes et la sécurité des données.  
- **Temporel** : Fonctionnalité livrée **d’ici la fin de la semaine 4**.  

2. **Dashboard temps réel**  
- **Spécifique** : Créer un tableau de bord affichant en temps réel les prix de USD/EUR, BTC/USD, ETH/USD et l’indice DXY.  
- **Mesurable** : Les prix doivent se mettre à jour au minimum toutes les **10 secondes**.  
- **Atteignable** : Intégration via API (CoinGecko, Exchange Rates, etc.).  
- **Réaliste** : Répond au besoin central d’apprentissage et de visualisation du marché.  
- **Temporel** : Dashboard interactif opérationnel **au plus tard semaine 6**.  

3. **Stratégies automatiques simples**  
- **Spécifique** : Implémenter 3 stratégies de trading automatisées (RSI, DCA, MA crossover).  
- **Mesurable** : Chaque stratégie doit pouvoir être activée/désactivée et produire un historique des transactions simulées.  
- **Atteignable** : Basées sur des indicateurs simples déjà testés par l’équipe.  
- **Réaliste** : Suffisant pour un MVP pédagogique, sans complexité excessive.  
- **Temporel** : Stratégies disponibles et testées **avant la semaine 10**.  

---

## 1. Stakeholders and Team Roles

**Stakeholders**  
- **Interne :**  
  - Julien Pulon (Front-end, UX, Stratégies)  
  - Thomas Rousseau (Back-end, API, Stratégies)  
- **Externe :**  
  - Instructeurs SUI (validation pédagogique)  
  - Utilisateurs cibles (débutants, étudiants, amateurs crypto)  
  - Fournisseurs d’API (CoinGecko, Binance, Exchange Rates, lightweightChart)  

**Team Roles & Responsibilities**

| Rôle              | Membre            | Responsabilités principales |
|-------------------|------------------|-----------------------------|
| Project Manager   | Julien Pulon     | Organisation, suivi, interface, UX |
| Backend Developer      | Thomas Rousseau  | API Flask, intégration données temps réel, logique de trading |
| Frontend Developer| Julien Pulon     | React, Tailwind, dashboard |
| Database Manager  | Thomas & Julien  | Conception et gestion PostgreSQL |
| QA & Testing      | Tous             | Vérification, tests unitaires, debug |

---

## 2. Define Scope

**In-Scope (MVP)**  
- Authentification email + mot de passe (JWT, bcrypt).  
- Dashboard avec prix en temps réel (crypto + forex).  
- Simulation d’achat/vente virtuel.  
- Historique des transactions et portefeuille.  
- Graphiques interactifs (PnL, évolution).  

**Out-of-Scope (MVP)**  
- Trading réel avec argent.  
- Intégration d’actifs trop nombreux (focus sur USD/EUR, BTC, ETH).  
- Stratégies complexes de trading quantitatif.  
- Fonctionnalités sociales avancées (chat, partage public).  
- Stratégie DCA automatique  
- Mode gamification (classement des traders).  

---

## 3. Identify Risks

| Risque               | Description | Solution |
|-----------------------|-------------|------------|
| **Techniques**        | Intégration API temps réel instable ou limitée. Apprentissage de nouveaux frameworks.| Prévoir fallback avec API alternative, mock data pour tests. Limiter les nouvelles technologies a implémenter et commencer a regarder des tutos.|
| **Complexité Stratégies** | Stratégies automatiques trop complexes pour MVP. | Se limiter à RSI et MA simples. |
| **Adoption Utilisateur** | Risque que l’interface soit trop technique pour les débutants. | Tests UX en continu avec feedback utilisateurs. |
| **Time Management**   | Délais serrés (3 mois). | Sprint planning Agile, milestones clairs. |

---

## 4. High-Level Plan

### Phase 1 : Cadrage & Préparation (Semaines 1–4)
- **Semaine 1** :  
  - Formation de l’équipe.  
  - Définition des rôles.  
  - Cadrage du projet + objectifs SMART.  
  - Rédaction du **Project Charter**.  

- **Semaine 2** :  
  - Validation du périmètre du MVP.  
  - Choix technologiques finaux (stack backend, frontend, DB).  
  - Organisation des outils de suivi (GitHub Projects, Agile board).  

- **Semaine 3** :  
  - Rédaction de la **documentation technique**.  
  - Schémas UML de la base de données (PostgreSQL).  
  - Spécification de l’API (endpoints REST/GraphQL, WebSocket).  

- **Semaine 4** :  
  - Architecture backend + frontend.  
  - Setup du repo (monorepo ou séparation backend/frontend).  
  - Mise en place du squelette projet (Flask + React + PostgreSQL).  

---

### Phase 2 : Fonctionnalités cœur du MVP (Semaines 5–9)
- **Semaine 5** :  
  - Modèle utilisateur complet (profil, portefeuille virtuel).  
  - Config DB PostgreSQL (users, assets, transactions).  
  - Authentification basique (JWT + bcrypt, signup/login).  

- **Semaine 6** :  
  - Passage d’ordres simulés (buy/sell) + stockage en DB.  
  - Connexion API externe via REST/WebSocket pour les prix en temps réel.  
  - Dashboard simple affichant **EUR/USD, BTC/USD, ETH/USD**.  

- **Semaine 7** :  
  - Historique utilisateur (liste des trades).  
  - Premiers graphiques (Recharts/Chart.js).  

- **Semaine 8 - 9** :  
  - Implémentation stratégie **RSI automatique**.    
  - Implémentation stratégie **MA crossover (50/200)**.
  - Tests unitaires backend (logiques des stratégies). 
  - Backtests avec données historiques.  

---

### Phase 3 : Expérience utilisateur & contenu (Semaines 10–11)
- **Semaine 10** :  
  - Amélioration UI/UX du dashboard (responsive, intuitif).  
  - Feedback visuel après trade (succès/échec).  

- **Semaine 11** :  
  - Ajout d’une section **actualités financières** (via NewsAPI).    

---

### Phase 4 : Finalisation & Demo Day (Semaine 12)
- **Semaine 12** :  
  - Tests d’intégration (frontend ↔ backend ↔ DB).  
  - Mini-guide utilisateur (onboarding).  
  - Correction des bugs critiques.  
  - Préparation **Demo Day** :  
    - Démo live d’un trade + stratégie auto.  
    - Dashboard complet (historique + leaderboard).  
    - Pitch produit clair : problème → solution → valeur ajoutée.   

---

## 👥 Auteurs

- [Thomas Rousseau](https://github.com/Tomsonne) 
- [Julien Pulon](https://github.com/JulienPul)

