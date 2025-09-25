// core/bootstrapModels.js
import '../models/user.model.js';
import '../models/asset.model.js';
import '../models/position.model.js';
import { applyAssociations } from '../models/associations.js';

applyAssociations();
// pas de sequelize.sync() si le schéma vient du SQL
