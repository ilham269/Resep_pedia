'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('countries', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      code: { type: Sequelize.CHAR(2), allowNull: false, unique: true },
      flag_emoji: { type: Sequelize.STRING(10), allowNull: true },
      continent: { type: Sequelize.STRING(50), allowNull: true },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('countries'); },
};
