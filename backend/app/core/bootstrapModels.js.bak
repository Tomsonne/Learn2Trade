import User from '../models/user.model.js';
import Strategy from '../models/strategy.model.js';
import Asset from '../models/asset.model.js';
import Position from '../models/position.model.js';
import Trade from '../models/trade.model.js';
import News from '../models/news.model.js';
import { applyAssociations } from '../models/associations.js';
import sequelize from './db.js';

const models = { User, Strategy, Asset, Position, Trade, News };

applyAssociations();

export async function syncDB() {
    await sequelize.sync({ alter: true }); // ou { force: true } si tu veux tout recréer
    console.log('✅ Database synced');
  }

export default models;
