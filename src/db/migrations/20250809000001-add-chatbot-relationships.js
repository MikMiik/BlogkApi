"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Add conversationId column to chatbot-histories table
    await queryInterface.addColumn("chatbot-histories", "conversationId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: "Reference to chatbot_conversations table",
      after: "userId", // Ensure it is after userId for logical grouping
    });

    // Step 2: Add foreign key constraint from chatbot-histories to chatbot_conversations
    await queryInterface.addConstraint("chatbot-histories", {
      fields: ["conversationId"],
      type: "foreign key",
      name: "fk_chatbot_histories_conversation",
      references: {
        table: "chatbot_conversations",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Step 3: Add foreign key constraint from chatbot-histories to users (if not exists)
    try {
      await queryInterface.addConstraint("chatbot-histories", {
        fields: ["userId"],
        type: "foreign key",
        name: "fk_chatbot_histories_user",
        references: {
          table: "users",
          field: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    } catch (error) {
      // Constraint might already exist, continue
      console.log("Foreign key constraint for userId might already exist");
    }

    // Step 4: Add index for better performance
    await queryInterface.addIndex("chatbot-histories", ["conversationId"], {
      name: "idx_chatbot_histories_conversation_id",
    });

    // Step 5: Add composite index for sessionId and conversationId
    await queryInterface.addIndex(
      "chatbot-histories",
      ["sessionId", "conversationId"],
      {
        name: "idx_chatbot_histories_session_conversation",
      }
    );

    // Step 6: Populate conversationId based on existing sessionId
    // This query will link existing chat histories to conversations
    await queryInterface.sequelize.query(`
      UPDATE \`chatbot-histories\` ch
      INNER JOIN \`chatbot_conversations\` cc ON ch.sessionId = cc.sessionId
      SET ch.conversationId = cc.id
      WHERE ch.conversationId IS NULL
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remove indexes
    await queryInterface.removeIndex(
      "chatbot-histories",
      "idx_chatbot_histories_conversation_id"
    );

    await queryInterface.removeIndex(
      "chatbot-histories",
      "idx_chatbot_histories_session_conversation"
    );

    // Remove foreign key constraints
    await queryInterface.removeConstraint(
      "chatbot-histories",
      "fk_chatbot_histories_conversation"
    );

    try {
      await queryInterface.removeConstraint(
        "chatbot-histories",
        "fk_chatbot_histories_user"
      );
    } catch (error) {
      // Constraint might not exist
    }

    // Remove conversationId column
    await queryInterface.removeColumn("chatbot-histories", "conversationId");
  },
};
