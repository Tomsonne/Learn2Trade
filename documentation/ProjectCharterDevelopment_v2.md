[ProjectCharterDevelopment_v2.md](https://github.com/user-attachments/files/23161564/ProjectCharterDevelopment_v2.md)
<p align="center">
  <img src="../images/Logo_L2T.png" alt="Logo" width="400"/>
</p>

# Project Charter – Learn2Trade

## 0. Project Objectives

**Purpose**  
Learn2Trade vise à rendre l’apprentissage du trading algorithmique accessible aux débutants grâce à une plateforme web intuitive permettant de simuler des stratégies sur crypto et forex sans risque financier.  
Le projet combine des outils pédagogiques, un tableau de bord interactif et des indicateurs techniques simples pour une expérience d’apprentissage complète.

### Objectifs SMART

1. **Authentification sécurisée**  
- Spécifique : Authentification par email et mot de passe avec JWT et bcrypt.  
- Mesurable : 100 % des utilisateurs peuvent créer un compte, se connecter et maintenir une session.  
- Atteignable : Utilisation de bibliothèques standard (Express.js, bcrypt, JWT).  
- Réaliste : Requis pour la gestion sécurisée des comptes utilisateurs.  
- Temporel : Fonctionnalité livrée avant la fin du Sprint 1.

2. **Dashboard temps réel**  
- Spécifique : Tableau de bord affichant les prix de BTC/USD et ETH/USD en temps réel, calcul des KPI et du PnL.  
- Mesurable : Rafraîchissement automatique toutes les 10 secondes minimum.  
- Atteignable : Intégration via l’API Binance.  
- Réaliste : Reflète le besoin principal de visualisation et d’apprentissage du marché.  
- Temporel : Fonctionnalité opérationnelle au Sprint 2.

3. **Stratégies automatiques**  
- Spécifique : Implémenter deux stratégies de trading simples (RSI, MA Crossover).  
- Mesurable : Chaque stratégie produit un historique des trades simulés.  
- Atteignable : Basées sur des indicateurs simples déjà testés.  
- Réaliste : Suffisant pour un MVP pédagogique.  
- Temporel : Fonctionnelles avant la fin du Sprint 3.

4. **Expérience utilisateur et vidéo de présentation**  
- Spécifique : Ajouter une vidéo d’accueil sur la page principale pour inciter à la création de compte.  
- Mesurable : Le taux de clic sur “Créer un compte” doit augmenter d’au moins 20 %.  
- Atteignable : Fichiers vidéo optimisés (`video.mp4`, `video_faststart.mp4`) intégrés via React.  
- Réaliste : Améliore l’engagement et la clarté du parcours utilisateur.  
- Temporel : Mise en ligne au Sprint 4.

---

## 1. Stakeholders and Team Roles

**Stakeholders**
- Interne :
  - Julien Pulon : Développeur full stack, responsable du design et du développement.  
  - Thomas Rousseau : Contributeur initial (conception des stratégies et base du backend).  
- Externe :
  - Instructeurs Holberton (validation technique et pédagogique).  
  - Utilisateurs cibles : étudiants, débutants, amateurs de crypto.  
  - Fournisseurs d’API : Binance, NewsAPI.

**Team Roles & Responsibilities**

| Rôle | Membre | Responsabilités principales |
|------|---------|-----------------------------|
| Chef de projet / Développeur Full Stack | Julien Pulon |  Thomas Rousseau | Coordination, architecture, développement frontend et backend |
| Backend Developer  API Express, PostgreSQL, logique de trading |
| Frontend Developer React, TailwindCSS, Dashboard, intégration API |
| QA & Testing | Julien Pulon | Tests unitaires Jest, validation Postman |


---

## 2. Define Scope

**In-Scope (MVP)**
- Authentification email + mot de passe (JWT, bcrypt).  
- Tableau de bord complet (solde, PnL, positions, distribution).  
- Graphique temps réel avec Lightweight Charts.  
- Simulation de trading virtuel (Buy/Sell).  
- Stratégies RSI et MA Crossover.  
- Vidéo d’accueil sur la page principale (incitation à l’inscription).  
- Déploiement sur Vercel (frontend) et Railway (backend).

**Out-of-Scope (MVP)**
- Trading réel avec argent.  
- Stratégies complexes (IA, arbitrage).  
- DCA automatique.  
- Classement des utilisateurs.  
- Interaction sociale (commentaires, likes).  

---

## 3. Identify Risks

| Risque | Description | Solution |
|--------|--------------|----------|
| API Binance | Limites d’appel ou pannes temporaires. | Implémenter un cache local et un mode dégradé avec données historiques. |
| Performance du dashboard | Rendu lourd avec beaucoup de données. | Utiliser useMemo et optimisations TailwindCSS. |
| Sécurité JWT | Risque de fuite de token. | Stockage sécurisé en HTTP-only cookie, expiration courte. |
| Temps de développement | Découpage précis en sprints et automatisation des tests. |

---

## 4. High-Level Plan

### Phase 1 : Préparation 
- Structuration du projet backend (`api`, `controllers`, `models`, `services`).  
- Configuration Docker (Node + PostgreSQL).  
- Schéma SQL et premiers tests Jest.

### Phase 2 : Fonctionnalités principales 
- Authentification (JWT + bcrypt).  
- API Express opérationnelle.  
- Dashboard React connecté au backend.  
- Graphique en temps réel via Lightweight Charts.  

### Phase 3 : Stratégies et trading 
- Implémentation des stratégies RSI et MA Crossover.  
- Simulation des trades et calcul du PnL.  
- Historique utilisateur et performance.  

### Phase 4 : UX et mise en production 
- Vidéo d’accueil et CTA sur la homepage.  
- Amélioration UI/UX (dark mode, responsive).  
- Déploiement sur Vercel + Railway.  
- Tests d’intégration finaux et préparation Demo Day.  

---

## 5. Deliverables
| Livrable | Emplacement |
|-----------|-------------|
| Code source complet | https://github.com/Tomsonne/Learn2Trade/tree/main |
| Application en ligne | [https://learn2-trade.vercel.app](https://learn2-trade.vercel.app) |
| Trello | https://trello.com/b/xV7jt6Jt/l2t |
| Rapport hebdomadaire | WeeklyReport.md |
| Documentation technique | TechnicalDocumentation.md |
| Présentation et schémas | images/high_level_diagram.png, images/page_dashboards.png, images/page_acceuil.png |

---

## 6. Auteurs
- Julien Pulon — Développeur Full Stack.  
- Thomas Rousseau — Développeur Full Stack. 



