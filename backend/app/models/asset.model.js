import { Model, DataTypes } from "sequelize";
import sequelize from "../core/db.js";

class Asset extends Model {}

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
      validate: { isIn: [["crypto", "forex", "index"]] },
    },
  },
  {
    sequelize,
    tableName: "assets",
    modelName: "Asset",
    timestamps: false,
    underscored: true,
    indexes: [
      { unique: true, fields: ["symbol"] },
      { fields: ["kind"] },
    ],
    hooks: {
      beforeValidate(asset) {
        if (asset.symbol) asset.symbol = asset.symbol.toUpperCase().trim();
        if (asset.kind) asset.kind = asset.kind.toLowerCase().trim();
      },
    },
  }
);

export default Asset;
