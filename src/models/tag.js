'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {
    static associate(models) {
      Tag.belongsToMany(models.Recipe, { through: models.RecipeTag, foreignKey: 'tag_id', as: 'recipes' });
    }
  }
  Tag.init({
    name: { type: DataTypes.STRING(100), allowNull: false },
    slug: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  }, { sequelize, modelName: 'Tag', tableName: 'tags', timestamps: false });
  return Tag;
};
