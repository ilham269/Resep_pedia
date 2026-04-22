'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('recipes', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: Sequelize.STRING(255), allowNull: false },
      slug: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      description: { type: Sequelize.TEXT, allowNull: true },
      author_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' }, onDelete: 'CASCADE',
      },
      category_id: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'categories', key: 'id' }, onDelete: 'SET NULL',
      },
      region_id: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'regions', key: 'id' }, onDelete: 'SET NULL',
      },
      country_id: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'countries', key: 'id' }, onDelete: 'SET NULL',
      },
      prep_time: { type: Sequelize.INTEGER, allowNull: true },
      cook_time: { type: Sequelize.INTEGER, allowNull: true },
      servings: { type: Sequelize.INTEGER, defaultValue: 2 },
      difficulty: { type: Sequelize.ENUM('mudah', 'sedang', 'sulit'), defaultValue: 'mudah' },
      cover_image_url: { type: Sequelize.STRING(500), allowNull: true },
      status: { type: Sequelize.ENUM('draft', 'pending', 'published', 'rejected'), defaultValue: 'draft' },
      views_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      rating_avg: { type: Sequelize.DECIMAL(3, 2), defaultValue: 0.00 },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('recipes'); },
};
