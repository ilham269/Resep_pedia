'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('users');

    if (!tableDesc.avatar_url) {
      await queryInterface.addColumn('users', 'avatar_url', {
        type: Sequelize.STRING(500),
        allowNull: true,
        after: 'role',
      });
    }
    if (!tableDesc.bio) {
      await queryInterface.addColumn('users', 'bio', {
        type: Sequelize.TEXT,
        allowNull: true,
        after: 'avatar_url',
      });
    }
    if (!tableDesc.location) {
      await queryInterface.addColumn('users', 'location', {
        type: Sequelize.STRING(100),
        allowNull: true,
        after: 'bio',
      });
    }
    if (!tableDesc.is_verified) {
      await queryInterface.addColumn('users', 'is_verified', {
        type: Sequelize.TINYINT(1),
        defaultValue: 0,
        after: 'location',
      });
    }
    if (!tableDesc.reset_token) {
      await queryInterface.addColumn('users', 'reset_token', {
        type: Sequelize.STRING(255),
        allowNull: true,
        after: 'is_verified',
      });
    }
    if (!tableDesc.reset_token_expires) {
      await queryInterface.addColumn('users', 'reset_token_expires', {
        type: Sequelize.DATE,
        allowNull: true,
        after: 'reset_token',
      });
    }

    // Update ENUM role untuk tambah 'contributor'
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('user', 'contributor', 'admin'),
      allowNull: false,
      defaultValue: 'user',
    });
  },

  async down(queryInterface, Sequelize) {
    const cols = ['avatar_url', 'bio', 'location', 'is_verified', 'reset_token', 'reset_token_expires'];
    for (const col of cols) {
      await queryInterface.removeColumn('users', col);
    }
    await queryInterface.changeColumn('users', 'role', {
      type: Sequelize.ENUM('admin', 'user'),
      allowNull: false,
      defaultValue: 'user',
    });
  },
};
