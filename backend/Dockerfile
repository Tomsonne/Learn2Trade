# Étape 1 : Image de base
FROM node:20-alpine

# Étape 2 : Répertoire de travail (dans le bon dossier)
WORKDIR /usr/src/app

# Étape 3 : Copier package.json et package-lock.json
COPY package*.json ./

# Étape 4 : Installer les dépendances
RUN npm install --production

# Étape 5 : Copier le code source
COPY . .

# Étape 6 : Exposer le port
EXPOSE 8000

# Étape 7 : Commande de démarrage
CMD ["npm", "start"]
