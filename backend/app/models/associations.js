import User from './user.model.js';
import Asset from './asset.model.js';
import Position from './position.model.js';

export function applyAssociations() {
  // User 1—N Position
  User.hasMany(Position, {
    foreignKey: { name: 'user_id', allowNull: false },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    as: 'positions',
  });
  Position.belongsTo(User, {
    foreignKey: { name: 'user_id', allowNull: false },
    as: 'user',
  });

  // Asset 1—N Position
  Asset.hasMany(Position, {
    foreignKey: { name: 'asset_id', allowNull: false },
    onUpdate: 'CASCADE',
    as: 'positions',
  });
  Position.belongsTo(Asset, {
    foreignKey: { name: 'asset_id', allowNull: false },
    as: 'asset',
  });
}
