"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("user-privacy-settings", {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      profileVisibility: {
        type: Sequelize.STRING(50),
        defaultValue: "Public",
      },
      showEmail: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      showFollowersCount: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      showFollowingCount: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      allowDirectMessages: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      showOnlineStatus: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("user-privacy-settings");
  },
};
