'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Ingredient extends Model {
    static associate(models) {
      Ingredient.belongsTo(models.Recipe, { foreignKey: 'recipe_id' });
    }
  }
  Ingredient.init({
    recipe_id: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(255), allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    unit: { type: DataTypes.STRING(50), allowNull: true },
    notes: { type: DataTypes.STRING(255), allowNull: true },
  }, { sequelize, modelName: 'Ingredient', tableName: 'ingredients', timestamps: false });
  return Ingredient;
};
