'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('categories', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      slug: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      icon: { type: Sequelize.STRING(10), allowNull: true },
      description: { type: Sequelize.TEXT, allowNull: true },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('categories'); },
};
