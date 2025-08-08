"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("chatbot-histories", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      sessionId: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "Unique session identifier for grouping chat messages",
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "User ID if authenticated, null for anonymous users",
      },
      messageContent: {
        type: Sequelize.JSON,
        allowNull: false,
        comment:
          'Message content in OpenAI format: {role: "user"|"assistant"|"system", content: "message"}',
      },
      agentName: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "Name of the agent that handled this message",
      },
      messageType: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "user",
        comment: "Type of message: user, assistant, system",
      },
      confidence: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: "Classification confidence score for agent selection",
      },
      classificationMethod: {
        type: Sequelize.STRING(30),
        allowNull: true,
        comment:
          "Method used for classification: pattern_matching, keyword_matching, llm_classification",
      },
      estimatedCost: {
        type: Sequelize.DECIMAL(10, 6),
        allowNull: true,
        defaultValue: 0,
        comment: "Estimated cost of processing this message",
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Additional metadata about the message processing",
      },
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

    // Add indexes for better query performance
    await queryInterface.addIndex("chatbot-histories", ["sessionId"]);
    await queryInterface.addIndex("chatbot-histories", ["userId"]);
    await queryInterface.addIndex("chatbot-histories", [
      "sessionId",
      "createdAt",
    ]);
    await queryInterface.addIndex("chatbot-histories", ["messageType"]);
    await queryInterface.addIndex("chatbot-histories", ["agentName"]);
    await queryInterface.addIndex("chatbot-histories", ["createdAt"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("chatbot-histories");
  },
};
