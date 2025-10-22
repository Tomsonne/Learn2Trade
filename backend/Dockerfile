# Étape 1 : Image de base
FROM node:20-alpine

# Étape 2 : Répertoire de travail (dans le bon dossier)
WORKDIR /usr/src/app

# Étape 3 : Copier uniquement le backend
COPY backend/package*.json ./

# Étape 4 : Installer les dépendances
RUN npm install --production

# Étape 5 : Copier le code source du backend
COPY backend .

# Étape 6 : Variables d'environnement
ENV PORT=8000
ENV NODE_ENV=production

# Étape 7 : Exposer le port
EXPOSE 8000

# Étape 8 : Commande de démarrage
CMD ["npm", "start"]
