'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SavedRecipe extends Model {
    static associate(models) {
      SavedRecipe.belongsTo(models.Recipe, { foreignKey: 'recipe_id', as: 'recipe' });
      SavedRecipe.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  SavedRecipe.init({
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    recipe_id: { type: DataTypes.INTEGER, allowNull: false },
  }, { sequelize, modelName: 'SavedRecipe', tableName: 'saved_recipes' });
  return SavedRecipe;
};
