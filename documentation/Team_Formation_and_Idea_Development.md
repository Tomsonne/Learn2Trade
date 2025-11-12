<p align="center">
  <img src="../images/Logo_L2T.png" alt="Logo" width="400"/>
</p>

# Idea Development Documentation

## 0. Formation de l’équipe  

### Forces de l’équipe  
Notre équipe est composée de deux membres aux compétences complémentaires et alignées avec le projet **Learn2Trade** :  

- **Julien Pulon** : passionné par le trading et les indicateurs techniques, il est particulièrement à l’aise avec le développement front-end.  
Son expérience en agence de web marketing, où il a réalisé des audits UX et SEO sur des sites et applications, lui apporte une expertise précieuse pour concevoir une interface claire, intuitive et optimisée.  
Cette double compétence technique et marketing garantit que la plateforme sera non seulement fonctionnelle mais aussi attractive et accessible pour les utilisateurs.  

- **Thomas Rousseau** : fort de son expérience en trading de paires de devises et d’une stratégie déjà testée avec succès sur plusieurs mois, il se spécialise dans le développement back-end.  
Il apporte ses compétences pour structurer l’API, intégrer les données en temps réel et mettre en place la logique des stratégies automatisées.  

- **Compétence commune** : Julien et Thomas partagent une solide maîtrise de SQL et des bases de données, assurant la gestion fiable et efficace des utilisateurs, transactions simulées et historiques de performance.  

👉 Cette combinaison — UX/SEO et front-end pour Julien, back-end et logique métier pour Thomas, et SQL pour les deux — forme une équipe équilibrée et complémentaire, capable de livrer un projet éducatif robuste et centré sur l’utilisateur.  

**Normes de communication** : Slack, Email, Google Drive, Stand-up journaliers.  

---

## 1. Research and Brainstorming  

### Pitch  
Une application simple et intuitive pour apprendre à trader USD, EUR, BTC et ETH en temps réel avec un suivi des performances et des stratégies automatisées, avec la possibilité de s’informer sur la finance traditionnelle et la crypto.  

### Sources d’inspiration explorées  
- **Problèmes réels** : plateformes de trading souvent complexes, peu adaptées aux débutants et manquent de pédagogie.  
- **Tendances** : montée des néo-brokers (Trading212, eToro), mais manque d’options simples pour s’initier avec crypto + forex dans un seul outil.  
- **Solutions innovantes** : combiner apprentissage (finance traditionnelle et crypto), simulation de trading, et automatisation basique dans une solution ludique.  

### Techniques utilisées  
- **Mind Mapping** : autour des thèmes finance → trading → apprentissage → automatisation → accessibilité.  
- **SCAMPER Framework** :  
  - **Substitute** : remplacer les plateformes lourdes par une interface simple.  
  - **Combine** : rassembler crypto + forex + indices + news + stratégie simple.  
  - **Adapt** : reprendre le modèle “paper trading” déjà utilisé par certains brokers, mais l’adapter à des débutants.  
  - **Modify** : simplifier les interfaces et indicateurs.  
  - **Put to another use** : utiliser la simulation comme outil pédagogique.  
  - **Eliminate** : supprimer la complexité des sites de trading habituels qui manquent de pédagogie.  
  - **Reverse** : au lieu de former avant de trader, apprendre en pratiquant via un simulateur.  

### “How Might We” Questions  
- Comment rendre le trading accessible aux novices sans expérience ?  
- Comment combiner apprentissage + pratique + information en un seul outil ?  
- Comment sécuriser une première expérience de trading sans risque financier ?  

---

## 2. Idea Evaluation  

### Critères d’évaluation  
- **Faisabilité technique** (stack maîtrisés : NodeJs, NestJS, React, PostgreSQL).  
- **Impact potentiel** (intérêt pédagogique + attractivité pour débutants).  
- **Alignement technique** (API externes pour prix et informations + sécurité JWT).  
- **Scalabilité** (possibilité d’ajouter d’autres stratégies/actifs / passer en réel à très long terme).  

### Évaluation des idées (rubric 1–5)  

| Idée                                | Faisabilité | Impact | Scalabilité | Total | Risques                        |
|-------------------------------------|-------------|--------|-------------|-------|--------------------------------|
| Plateforme de trading simplifiée (Learn2Trade) | 5 | 4 | 5 | 14 | Temps réel, API limitées |
| Application d’éducation boursière uniquement   | 4 | 3 | 3 | 10 | Trop théorique |
| Bot de trading crypto automatisé              | 3 | 4 | 5 | 12 | Risque technique + régulation |
| Agrégateur d’actualités financières           | 5 | 3 | 4 | 12 | Faible différenciation |

---

## 3. Decision and Refinement  

- **Idée retenue** : Learn2Trade (MVP plateforme de trading simplifiée en simulation).  
- **Problème résolu** : le manque d’outils pédagogiques simples pour débuter en trading sans risque financier.  
- **Audience cible** : débutants curieux du trading, étudiants en finance, amateurs crypto.  

### Fonctionnalités clés (MVP)  
- Authentification sécurisée, email + mot de passe (JWT + bcrypt).  
- Dashboard prix temps réel (USD/EUR, BTC/USD, ETH/USD)+ infos finance (API externe).  
- Simulation d’ordres (mode simulation).  
- Historique des transactions + graphiques.  
- Stratégies automatiques RSI / MA.  
- News économiques.  

### Résultats attendus  
Application web responsive. Expérience claire, ludique et motivante, apprentissage pratique, démonstration full-stack.  

---

## 4. Idea Development Documentation  

### Idées considérées  
1. Plateforme d’apprentissage de trading simplifiée (Learn2Trade) → **retenue** car la plus complète.  
2. Application éducative finance → **rejetée** car trop limitée.  
3. Bot de trading crypto auto → **rejeté** pour l’MVP car trop complexe/régulé.  
4. Agrégateur d’actualités → **rejeté** car peu différenciant.  

### Résumé MVP sélectionné  
Learn2Trade est une application web de paper trading intégrant crypto et forex, destinée aux débutants.  

### Raisons du choix  
- Réalisable en 3 mois.  
- Compétences full-stack alignées.  
- Impact fort et logique métier (banque, fonds d’investissement…).  

### Potentiel impact  
- Démocratiser l’apprentissage.  
- Outil pédagogique pratique.  
- Base pour de futures évolutions.

## 👥 Auteurs

- [Thomas Rousseau](https://github.com/Tomsonne) 
- [Julien Pulon](https://github.com/JulienPul)


