# 📄 Weekly Progress Report – Learn2Trade

## ✅ Semaine du 15 au 19 Septembre 2025

### 1. Structuration du projet backend
- Mise en place d’une arborescence claire pour séparer les responsabilités :  
  - `api` pour les routes (endpoints REST)  
  - `controllers` pour la logique API  
  - `services` pour la logique métier  
  - `models` pour les classes correspondant aux tables SQL  
  - `core` pour la configuration et la connexion à la base  
  - `test` pour les tests unitaires  
- Intégration d’un fichier `server.js` comme point d’entrée du backend.  
- Préparation des dossiers nécessaires pour accueillir progressivement les endpoints et la logique métier.  

---

### 2. Mise en place de la base de données
- Choix de **PostgreSQL** comme base relationnelle.  
- Création d’un script `schema.sql` regroupant toutes les tables nécessaires au projet :  
  - `users`  
  - `assets`  
  - `strategies`  
  - `trades`  
  - `positions`  
  - `strategy_signals`  
  - `news_cache`  
- Configuration d’un conteneur **Docker Postgres** pour faciliter le déploiement et l’initialisation automatique de la base.  
- Vérification du bon fonctionnement via **DBeaver/pgAdmin4** et exécution de premières requêtes de test pour valider la création des tables.  

---

### 3. Configuration serveur
- Mise en place d’un serveur **Express.js** avec les middlewares de base (sécurité, logs, parsing JSON).  
- Lancement du serveur via `docker-compose` et validation de la communication entre le backend et la base de données.  
- Test de connectivité pour confirmer que l’environnement est prêt à accueillir les premiers endpoints.  

---

## 🎯 Résultats de la semaine
- Une **arborescence backend claire** et prête à être développée.  
- Une **base de données PostgreSQL opérationnelle** avec un schéma validé.  
- Un **serveur Node.js fonctionnel**, capable de répondre à des requêtes simples et connecté à la base.  

---

## 🔜 Prochaines étapes
- Implémentation des **classes modèles** correspondant aux tables SQL.  
- Développement des **premiers endpoints essentiels** :  
  - Inscription / connexion utilisateurs  
  - Récupération des actifs disponibles  
  - Enregistrement de trades  
- Mise en place de **tests unitaires simples** pour valider la cohérence backend ↔ base de données.


  # 📄 Weekly Progress Report – Learn2Trade  

## ✅ Semaine du 22 au 26 Septembre 2025  

### 1. Réorganisation de l’arborescence backend  
- Refonte de la structure du dossier backend pour mieux séparer les responsabilités :  
  - `models/` → définitions des classes Sequelize.  
  - `services/` → logique métier (prévu, pas encore implémenté).  
  - `controllers/` → gestion des appels API (prévu).  
  - `api/` → définition des routes.  
  - `core/` → configuration DB & serveur.  
  - `test/` → tests unitaires Jest.  
- Objectif : obtenir une architecture claire et scalable pour l’implémentation des futures fonctionnalités.  

---

### 2. Implémentation des classes modèles  
- Création des classes Sequelize pour les entités principales (`User`, `Asset`, `Strategy`, `Trade`, `Position`, `News`).  
- Ajout de hooks de validation et de normalisation simples (ex : `symbol` toujours en majuscules, `kind` en minuscules).  
- Définition des relations entre entités (ex: un `User` peut avoir plusieurs `Trades`).  

---

### 3. Tests unitaires de base  
- Mise en place de **tests Jest** pour vérifier la bonne création et cohérence des modèles.  
- Validation des contraintes principales (unicité des emails, normalisation des champs).  
- Tests exécutés sur une base **SQLite en mode test** → tous les cas prévus passent avec succès.  

---

## 🎯 Résultats de la semaine  
- Une **arborescence projet ajustée et claire**, prête pour accueillir la logique métier.  
- **Classes Sequelize implémentées** et reliées au schéma DB.  
- **Tests unitaires initiaux validés** confirmant la cohérence des modèles.  

---

## 🔜 Prochaines étapes  
- Implémenter progressivement les **méthodes dans les services** (ex: création utilisateur, enregistrement trade).  
- Commencer les **premiers endpoints REST** (authentification, récupération d’actifs).  
- Étendre la couverture de tests pour inclure la logique métier et les endpoints.  

