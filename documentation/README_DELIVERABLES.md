[README_DELIVERABLES.md](https://github.com/user-attachments/files/23161597/README_DELIVERABLES.md)
# README – Deliverables for Learn2Trade

## 1. Project Overview
Learn2Trade est une plateforme web pédagogique de simulation de trading, développée en JavaScript (Node.js + Express + React + PostgreSQL).  
Elle permet aux utilisateurs d’apprendre le trading à travers des stratégies simples (RSI, MA Crossover), un tableau de bord interactif, et des données de marché en temps réel issues de l’API Binance.

Déploiement public : [https://learn2-trade.vercel.app](https://learn2-trade.vercel.app)

---

## 2. Documents livrables

| Type | Fichier | Description |
|------|----------|--------------|
| Cahier des charges initial | `ProjectCharterDevelopment.md` | Document de cadrage d’origine (non modifié) |
| Cahier des charges mis à jour | `ProjectCharterDevelopment_v2.md` | Version alignée avec l’implémentation finale |
| Documentation technique initiale | `TechnicalDocumentation.md` | Stack Flask initialement prévue |
| Documentation technique – Addendum | `TechnicalDocumentation_Addendum.md` | Différences et version réelle (Express/React) |
| Rapport hebdomadaire | `WeeklyReport.md` | Suivi semaine par semaine (du 15 sept au 24 oct) |
| README livrables | `README_DELIVERABLES.md` | Synthèse finale des livrables et liens utiles |

---

## 3. Code source

| Élément | Lien |
|----------|------|
| **Repository GitHub** | https://github.com/Tomsonne/Learn2Trade/tree/main |
| **Frontend (React)** | `/frontend/` |
| **Backend (Express API)** | `/backend/` |
| **Schéma SQL** | `/backend/db/init/schema.sql` |
| **Tests unitaires** | `/backend/test/` |

---

## 4. Environnements de déploiement

| Composant | Hébergeur | URL |
|------------|------------|------|
| Frontend | **Vercel** | [https://learn2-trade.vercel.app](https://learn2-trade.vercel.app) |
| Backend API | **Railway** | *(URL API selon déploiement)* |
| Base de données | **PostgreSQL (Docker)** | Hébergée localement en développement |

---

## 5. Sprint Planning

| Sprint | Période | Objectifs principaux |
|--------|----------|----------------------|
| Sprint 1 | 27 sept – 10 oct | Mise en place du backend, base de données, authentification JWT |
| Sprint 2 | 11 – 24 oct | Dashboard React + intégration API Binance |
| Sprint 3 | 25 oct – 7 nov | Vidéo homepage + performance + déploiement |
| Sprint 4 | 8 – 15 nov | Tests Postman/Jest, QA finale, documentation complète |

Méthode utilisée : **MoSCoW Prioritization** et suivi agile via **Trello + Weekly Reports**.

---

## 6. Tests et Validation

### Tests réalisés
- **Tests unitaires (Jest)** : services `auth.service.js`, `user.service.js`
- **Tests d’intégration (Postman)** : endpoints `/auth`, `/trade`, `/position`
- **Tests finaux (prod)** : Vercel + Railway → connexions et dashboard validés

---

## 7. Suivi et rétrospective

- Suivi de progression : `WeeklyReport.md`  
- Outil de gestion : Trello / GitHub https://trello.com/b/xV7jt6Jt/l2t 
- Changements majeurs : migration CoinGecko → Binance, suppression DCA, ajout vidéo homepage  
- Revue finale : application stable et déployée, tests validés, documentation complète.

---

## 8. Contact et présentation

**Auteur :** Julien Pulon – Développeur Full Stack  
**Formation :** Holberton School France  
**Projet :** Learn2Trade (Demo Day / Spécialisation Full Stack)  
**Email :** pulonjulien@gmail.com.com 

**Auteur :**  Thomas – Développeur Full Stack  
**Formation :** Holberton School France  
**Projet :** Learn2Trade (Demo Day / Spécialisation Full Stack)  
**Email :** thomas.rousseau19@gmail.com 

---

**Remarque :**
Tous les documents initiaux sont conservés pour la traçabilité pédagogique.  
Les fichiers “_v2” et “_Addendum” représentent la version finale validée lors du développement effectif.



