# Étape 1 : Image de base
FROM node:20-alpine

# Étape 2 : Répertoire de travail
WORKDIR /usr/src/app

# Étape 3 : Copier package.json et installer deps
COPY package*.json ./
RUN npm install --production

# Étape 4 : Copier le code source
COPY . .

# Étape 5 : Variables d'environnement par défaut
ENV PORT=8000
ENV NODE_ENV=production

# Étape 6 : Exposer le port
EXPOSE 8000

# Étape 7 : Commande de démarrage
CMD ["node", "app/server.js"]
