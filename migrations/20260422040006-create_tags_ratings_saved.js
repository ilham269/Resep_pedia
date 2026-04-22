'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tags', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      slug: { type: Sequelize.STRING(100), allowNull: false, unique: true },
    });

    await queryInterface.createTable('recipe_tags', {
      recipe_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'recipes', key: 'id' }, onDelete: 'CASCADE',
      },
      tag_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'tags', key: 'id' }, onDelete: 'CASCADE',
      },
    });
    await queryInterface.addConstraint('recipe_tags', {
      fields: ['recipe_id', 'tag_id'], type: 'primary key', name: 'pk_recipe_tags',
    });

    await queryInterface.createTable('ratings', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      recipe_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'recipes', key: 'id' }, onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE',
      },
      score: { type: Sequelize.TINYINT, allowNull: false },
      review_text: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addConstraint('ratings', {
      fields: ['recipe_id', 'user_id'], type: 'unique', name: 'unique_rating',
    });

    await queryInterface.createTable('saved_recipes', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE',
      },
      recipe_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'recipes', key: 'id' }, onDelete: 'CASCADE',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addConstraint('saved_recipes', {
      fields: ['user_id', 'recipe_id'], type: 'unique', name: 'unique_save',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('saved_recipes');
    await queryInterface.dropTable('ratings');
    await queryInterface.dropTable('recipe_tags');
    await queryInterface.dropTable('tags');
  },
};
