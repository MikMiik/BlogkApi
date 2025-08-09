"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Check if conversationId column exists before adding it
    const tableDescription =
      await queryInterface.describeTable("chatbot-histories");

    if (!tableDescription.conversationId) {
      await queryInterface.addColumn("chatbot-histories", "conversationId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "Reference to chatbot_conversations table",
        after: "userId", // Ensure it is after userId for logical grouping
      });
    }

    // Step 2: Add foreign key constraint from chatbot-histories to chatbot_conversations
    try {
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
    } catch (error) {
      console.log(
        "Foreign key constraint for conversationId might already exist"
      );
    }

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

    // Step 4: Add index for better performance (check if exists first)
    try {
      await queryInterface.addIndex("chatbot-histories", ["conversationId"], {
        name: "idx_chatbot_histories_conversation_id",
      });
    } catch (error) {
      console.log("Index for conversationId might already exist");
    }

    // Step 5: Add composite index for sessionId and conversationId (check if exists first)
    try {
      await queryInterface.addIndex(
        "chatbot-histories",
        ["sessionId", "conversationId"],
        {
          name: "idx_chatbot_histories_session_conversation",
        }
      );
    } catch (error) {
      console.log("Composite index might already exist");
    }

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
    try {
      await queryInterface.removeIndex(
        "chatbot-histories",
        "idx_chatbot_histories_conversation_id"
      );
    } catch (error) {
      console.log("Index might not exist");
    }

    try {
      await queryInterface.removeIndex(
        "chatbot-histories",
        "idx_chatbot_histories_session_conversation"
      );
    } catch (error) {
      console.log("Composite index might not exist");
    }

    // Remove foreign key constraints
    try {
      await queryInterface.removeConstraint(
        "chatbot-histories",
        "fk_chatbot_histories_conversation"
      );
    } catch (error) {
      console.log("Foreign key constraint might not exist");
    }

    try {
      await queryInterface.removeConstraint(
        "chatbot-histories",
        "fk_chatbot_histories_user"
      );
    } catch (error) {
      // Constraint might not exist
    }

    // Remove conversationId column only if it exists
    const tableDescription =
      await queryInterface.describeTable("chatbot-histories");
    if (tableDescription.conversationId) {
      await queryInterface.removeColumn("chatbot-histories", "conversationId");
    }
  },
};
