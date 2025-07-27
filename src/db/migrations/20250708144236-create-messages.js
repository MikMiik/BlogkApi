"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("messages", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      senderId: {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
      },
      conversationId: {
        type: Sequelize.INTEGER,
        references: {
          model: "conversations",
          key: "id",
        },
      },
      type: {
        type: Sequelize.STRING(50),
        defaultValue: "text",
      },
      content: Sequelize.TEXT,
      status: {
        type: Sequelize.STRING(50),
        defaultValue: "sent",
      },
      deletedAt: Sequelize.DATE,
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
    await queryInterface.dropTable("messages");
  },
};
