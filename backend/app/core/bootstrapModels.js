// bootstrapModels.js
import User from "../models/user.model.js";
import Asset from "../models/asset.model.js";
import Strategy from "../models/strategy.model.js";
import Trade from "../models/trade.model.js";
import Position from "../models/position.model.js";
import News from "../models/news.model.js";
const models = { User, Asset, Strategy, Trade, Position, News };
export async function syncDB(options = { alter: true }) {
  await sequelize.sync(options);
  console.log(":white_check_mark: Base synchronisée avec Sequelize");
}
export default models;