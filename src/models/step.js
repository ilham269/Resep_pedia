'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Step extends Model {
    static associate(models) {
      Step.belongsTo(models.Recipe, { foreignKey: 'recipe_id' });
    }
  }
  Step.init({
    recipe_id: { type: DataTypes.INTEGER, allowNull: false },
    step_number: { type: DataTypes.INTEGER, allowNull: false },
    instruction: { type: DataTypes.TEXT, allowNull: false },
    image_url: { type: DataTypes.STRING(500), allowNull: true },
    duration_minutes: { type: DataTypes.INTEGER, allowNull: true },
  }, { sequelize, modelName: 'Step', tableName: 'steps', timestamps: false });
  return Step;
};
