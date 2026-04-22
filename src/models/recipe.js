'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Recipe extends Model {
    static associate(models) {
      Recipe.belongsTo(models.User, { foreignKey: 'author_id', as: 'author' });
      Recipe.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
      Recipe.belongsTo(models.Region, { foreignKey: 'region_id', as: 'region' });
      Recipe.belongsTo(models.Country, { foreignKey: 'country_id', as: 'country' });
      Recipe.hasMany(models.Ingredient, { foreignKey: 'recipe_id', as: 'ingredients', onDelete: 'CASCADE' });
      Recipe.hasMany(models.Step, { foreignKey: 'recipe_id', as: 'steps', onDelete: 'CASCADE' });
      Recipe.hasMany(models.Rating, { foreignKey: 'recipe_id', as: 'ratings' });
      Recipe.belongsToMany(models.Tag, { through: models.RecipeTag, foreignKey: 'recipe_id', as: 'tags' });
      Recipe.belongsToMany(models.User, { through: models.SavedRecipe, foreignKey: 'recipe_id', as: 'savedBy' });
    }
  }
  Recipe.init({
    title: { type: DataTypes.STRING(255), allowNull: false },
    slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    author_id: { type: DataTypes.INTEGER, allowNull: false },
    category_id: { type: DataTypes.INTEGER, allowNull: true },
    region_id: { type: DataTypes.INTEGER, allowNull: true },
    country_id: { type: DataTypes.INTEGER, allowNull: true },
    prep_time: { type: DataTypes.INTEGER, allowNull: true },
    cook_time: { type: DataTypes.INTEGER, allowNull: true },
    servings: { type: DataTypes.INTEGER, defaultValue: 2 },
    difficulty: { type: DataTypes.ENUM('mudah', 'sedang', 'sulit'), defaultValue: 'mudah' },
    cover_image_url: { type: DataTypes.STRING(500), allowNull: true },
    status: { type: DataTypes.ENUM('draft', 'pending', 'published', 'rejected'), defaultValue: 'draft' },
    views_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    rating_avg: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0.00 },
  }, { sequelize, modelName: 'Recipe', tableName: 'recipes' });
  return Recipe;
};
