'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Region extends Model {
    static associate(models) {
      Region.belongsTo(models.Country, { foreignKey: 'country_id', as: 'country' });
      Region.hasMany(models.Recipe, { foreignKey: 'region_id', as: 'recipes' });
    }
  }
  Region.init({
    name: { type: DataTypes.STRING(100), allowNull: false },
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    country_id: { type: DataTypes.INTEGER, allowNull: true },
    thumbnail_url: { type: DataTypes.STRING(500), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
  }, { sequelize, modelName: 'Region', tableName: 'regions', timestamps: false });
  return Region;
};
