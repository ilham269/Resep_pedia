'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Country extends Model {
    static associate(models) {
      Country.hasMany(models.Region, { foreignKey: 'country_id', as: 'regions' });
      Country.hasMany(models.Recipe, { foreignKey: 'country_id', as: 'recipes' });
    }
  }
  Country.init({
    name: { type: DataTypes.STRING(100), allowNull: false },
    code: { type: DataTypes.CHAR(2), allowNull: false, unique: true },
    flag_emoji: { type: DataTypes.STRING(10), allowNull: true },
    continent: { type: DataTypes.STRING(50), allowNull: true },
  }, { sequelize, modelName: 'Country', tableName: 'countries', timestamps: false });
  return Country;
};
