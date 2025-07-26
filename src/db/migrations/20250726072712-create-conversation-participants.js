"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("conversation_participants", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      conversationId: {
        type: Sequelize.INTEGER,
        references: {
          model: "conversations",
          key: "id",
        },
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
      },
      role: {
        type: Sequelize.STRING,
        defaultValue: "member",
      },
      joinedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    // await queryInterface.addConstraint("conversation_participants", {
    //   fields: ["conversationId", "userId"],
    //   type: "unique",
    //   name: "unique_participant_per_conversation",
    // });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("conversation_participants");
  },
};
