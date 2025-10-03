// app/models/index.js
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import sequelize from '../core/db.js';
import { Model as SequelizeModel } from 'sequelize';
export { default as User } from "./user.model.js";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const models = {};

// Charge tous les *.model.js (sauf index.js)
const files = fs
  .readdirSync(__dirname)
  .filter((f) => f.endsWith('.model.js') && f !== 'index.js');

for (const file of files) {
  const moduleUrl = pathToFileURL(path.join(__dirname, file)).href;
  const mod = await import(moduleUrl);
  const Exported = mod?.default;

  if (!Exported) continue;

  // Accepte :
  // - classes (extends Model) -> prototype instanceof SequelizeModel
  // - modèles "define" (ModelCtor) -> prototype instanceof SequelizeModel aussi
  const looksLikeSequelizeModel =
    typeof Exported === 'function' &&
    Exported.prototype instanceof SequelizeModel;

  if (!looksLikeSequelizeModel) {
    // Pas un modèle Sequelize : on ignore
    continue;
  }

  // Le nom de modèle Sequelize est fiable (Exported.name)
  models[Exported.name] = Exported;
}

// Appeler associate() quand tous les modèles sont là
for (const Exported of Object.values(models)) {
  if (typeof Exported.associate === 'function') {
    Exported.associate(models);
  }
}

export { sequelize };
export default models;
