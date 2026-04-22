'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RecipeTag extends Model {}
  RecipeTag.init({
    recipe_id: { type: DataTypes.INTEGER, primaryKey: true },
    tag_id: { type: DataTypes.INTEGER, primaryKey: true },
  }, { sequelize, modelName: 'RecipeTag', tableName: 'recipe_tags', timestamps: false });
  return RecipeTag;
};
