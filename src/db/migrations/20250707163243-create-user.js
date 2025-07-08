"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      firstName: Sequelize.STRING(50),

      lastName: Sequelize.STRING(50),

      email: { type: Sequelize.STRING(50), unique: true },

      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      username: {
        type: Sequelize.STRING(100),
        unique: true,
      },

      phone: {
        type: Sequelize.STRING(50),
        unique: true,
      },

      role: {
        type: Sequelize.STRING(191),
        defaultValue: "User",
      },

      status: Sequelize.STRING(50),

      twoFactorAuth: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      twoFactorSecret: Sequelize.STRING(50),

      followersCount: { type: Sequelize.INTEGER, defaultValue: 0 },

      followingCount: { type: Sequelize.INTEGER, defaultValue: 0 },

      likesCount: { type: Sequelize.INTEGER, defaultValue: 0 },

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
