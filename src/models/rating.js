'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Rating extends Model {
    static associate(models) {
      Rating.belongsTo(models.Recipe, { foreignKey: 'recipe_id' });
      Rating.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    }
  }
  Rating.init({
    recipe_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    score: { type: DataTypes.TINYINT, allowNull: false, validate: { min: 1, max: 5 } },
    review_text: { type: DataTypes.TEXT, allowNull: true },
  }, { sequelize, modelName: 'Rating', tableName: 'ratings' });
  return Rating;
};
