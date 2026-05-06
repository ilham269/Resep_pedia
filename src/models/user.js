'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Recipe, { foreignKey: 'author_id', as: 'recipes' });
      User.hasMany(models.Rating, { foreignKey: 'user_id', as: 'ratings' });
      User.belongsToMany(models.Recipe, { through: models.SavedRecipe, foreignKey: 'user_id', as: 'savedRecipes' });
      User.hasMany(models.RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });
    }
  }

  User.init({
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true, validate: { isEmail: true } },
    role: { type: DataTypes.ENUM('user', 'contributor', 'admin'), allowNull: false, defaultValue: 'user' },
    password: { type: DataTypes.STRING(255), allowNull: false },
    avatar_url: { type: DataTypes.STRING(500), allowNull: true },
    bio: { type: DataTypes.TEXT, allowNull: true },
    location: { type: DataTypes.STRING(100), allowNull: true },
    is_verified: { type: DataTypes.TINYINT(1), defaultValue: 0 },
    reset_token: { type: DataTypes.STRING(255), allowNull: true },
    reset_token_expires: { type: DataTypes.DATE, allowNull: true },
  }, {
    sequelize, modelName: 'User', tableName: 'users',
    defaultScope: { attributes: { exclude: ['password', 'reset_token', 'reset_token_expires'] } },
    scopes: { withPassword: { attributes: {} } },
  });

  return User;
};