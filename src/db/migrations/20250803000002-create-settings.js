"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("settings", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      email: { type: Sequelize.STRING(100), unique: true },

      // Account settings
      twoFactorEnabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      twoFactorSecret: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },

      // Content settings
      defaultPostVisibility: {
        type: Sequelize.STRING(20),
        defaultValue: "public",
      },
      allowComments: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      showViewCounts: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },

      // Notification settings
      notiNewComments: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      notiNewLikes: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      notiNewFollowers: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      notiWeeklyDigest: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },

      // Privacy settings
      profileVisibility: {
        type: Sequelize.STRING(20),
        defaultValue: "public",
      },
      searchEngineIndexing: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("settings");
  },
};
