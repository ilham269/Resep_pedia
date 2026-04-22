'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ingredients', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      recipe_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'recipes', key: 'id' }, onDelete: 'CASCADE',
      },
      name: { type: Sequelize.STRING(255), allowNull: false },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      unit: { type: Sequelize.STRING(50), allowNull: true },
      notes: { type: Sequelize.STRING(255), allowNull: true },
    });

    await queryInterface.createTable('steps', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      recipe_id: {
        type: Sequelize.INTEGER, allowNull: false,
        references: { model: 'recipes', key: 'id' }, onDelete: 'CASCADE',
      },
      step_number: { type: Sequelize.INTEGER, allowNull: false },
      instruction: { type: Sequelize.TEXT, allowNull: false },
      image_url: { type: Sequelize.STRING(500), allowNull: true },
      duration_minutes: { type: Sequelize.INTEGER, allowNull: true },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('steps');
    await queryInterface.dropTable('ingredients');
  },
};
