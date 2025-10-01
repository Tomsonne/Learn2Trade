// app/models/index.js
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import sequelize from '../core/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const models = {};

// Charger tous les *.model.js du dossier courant (sauf index.js)
const files = fs.readdirSync(__dirname).filter(
  (f) => f.endsWith('.model.js') && f !== 'index.js'
);

for (const file of files) {
  const moduleUrl = pathToFileURL(path.join(__dirname, file)).href;
  const mod = await import(moduleUrl);
  // Chaque fichier doit faire `export default class ModelName extends Model {}`
  const ModelClass = mod.default;
  if (!ModelClass?.init) {
    // pas un modèle Sequelize valide, on skip
    continue;
  }
  models[ModelClass.name] = ModelClass;
}

// Appeler associate quand tous les modèles sont là
Object.values(models).forEach((ModelClass) => {
  if (typeof ModelClass.associate === 'function') {
    ModelClass.associate(models);
  }
});

export { sequelize };
export default models;
