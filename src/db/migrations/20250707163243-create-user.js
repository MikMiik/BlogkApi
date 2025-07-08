"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      firstName: Sequelize.STRING(191),

      lastName: Sequelize.STRING(191),

      email: { type: Sequelize.STRING(191), allowNull: false, unique: true },

      password: {
        type: Sequelize.STRING(191),
        allowNull: false,
      },

      username: {
        type: Sequelize.STRING(191),
        allowNull: false,
        unique: true,
      },

      phone: {
        type: Sequelize.STRING(191),
        allowNull: false,
        unique: true,
      },

      role: {
        type: Sequelize.STRING(191),
        defaultValue: "User",
      },

      status: Sequelize.STRING(191),

      lastLogin: Sequelize.DATE,

      verifiedAt: Sequelize.DATE,

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  },
};
