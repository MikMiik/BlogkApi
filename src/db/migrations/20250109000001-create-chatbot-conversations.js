"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("chatbot_conversations", {
      id: {
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      sessionId: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      title: {
        type: Sequelize.STRING(500),
        allowNull: true,
        defaultValue: "New Conversation",
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      lastMessageAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      messageCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
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

    // Add indexes for better performance
    await queryInterface.addIndex("chatbot_conversations", ["sessionId"], {
      name: "idx_chatbot_conversations_session_id",
    });

    await queryInterface.addIndex("chatbot_conversations", ["userId"], {
      name: "idx_chatbot_conversations_user_id",
    });

    await queryInterface.addIndex(
      "chatbot_conversations",
      ["userId", "isActive"],
      {
        name: "idx_chatbot_conversations_user_active",
      }
    );

    await queryInterface.addIndex("chatbot_conversations", ["lastMessageAt"], {
      name: "idx_chatbot_conversations_last_message",
      order: [["lastMessageAt", "DESC"]],
    });

    await queryInterface.addIndex(
      "chatbot_conversations",
      ["userId", "updatedAt"],
      {
        name: "idx_chatbot_conversations_user_updated",
        order: [["updatedAt", "DESC"]],
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("chatbot_conversations");
  },
};
