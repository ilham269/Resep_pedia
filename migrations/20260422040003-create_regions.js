'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('regions', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      slug: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      country_id: {
        type: Sequelize.INTEGER, allowNull: true,
        references: { model: 'countries', key: 'id' },
        onDelete: 'SET NULL',
      },
      thumbnail_url: { type: Sequelize.STRING(500), allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('regions'); },
};
