// app/models/asset.model.js
import { Model, DataTypes } from 'sequelize';
import sequelize from '../core/db.js';

export default class Asset extends Model {
  static associate(models) {
    // Récupère Position
    const Position = models.Position;

    // Vérif robuste: Position doit être une sous-classe de Sequelize.Model
    const isSequelizeModel =
      typeof Position === 'function' &&
      Object.getPrototypeOf(Position?.prototype)?.constructor?.name === 'Model';

    if (!isSequelizeModel) {
      console.warn(
        '[ASSOC] Asset.hasMany(Position) ignoré: Position invalide ->',
        Position && (Position.name || typeof Position)
      );
      return;
    }

    // Association (clé asset_id côté Position)
    Asset.hasMany(Position, {
      foreignKey: { name: 'asset_id', allowNull: false },
      as: 'positions',
    });
  }
}

Asset.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    symbol: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true,
      validate: { notEmpty: true },
    },
    kind: {
      type: DataTypes.STRING(16),
      allowNull: false,
      validate: { isIn: [['crypto', 'forex', 'index']] },
    },
  },
  {
    sequelize,
    modelName: 'Asset',
    tableName: 'assets',
    underscored: true,
    timestamps: false,
    hooks: {
      beforeValidate(asset) {
        if (asset.symbol) asset.symbol = asset.symbol.toUpperCase().trim();
        if (asset.kind) asset.kind = asset.kind.toLowerCase().trim();
      },
    },
    indexes: [{ unique: true, fields: ['symbol'] }, { fields: ['kind'] }],
  }
);
