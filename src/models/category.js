'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Recipe, { foreignKey: 'category_id', as: 'recipes' });
    }
  }
  Category.init({
    name: { type: DataTypes.STRING(100), allowNull: false },
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    icon: { type: DataTypes.STRING(10), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
  }, { sequelize, modelName: 'Category', tableName: 'categories', timestamps: false });
  return Category;
};
