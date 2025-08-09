"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ChatHistory extends Model {
    static associate(models) {
      // Association with User
      ChatHistory.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });

      // Association with ChatbotConversation
      ChatHistory.belongsTo(models.ChatbotConversation, {
        foreignKey: "conversationId",
        as: "conversation",
      });

      // Alternative association through sessionId for backward compatibility
      ChatHistory.belongsTo(models.ChatbotConversation, {
        foreignKey: "sessionId",
        targetKey: "sessionId",
        as: "conversationBySession",
      });
    }

    // Instance methods
    toOpenAIFormat() {
      return this.messageContent;
    }

    isUserMessage() {
      return this.messageType === "user";
    }

    isAssistantMessage() {
      return this.messageType === "assistant";
    }
  }

  ChatHistory.init(
    {
      sessionId: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "Unique session identifier for grouping chat messages",
      },
      conversationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Reference to chatbot_conversations table",
        references: {
          model: "chatbot_conversations",
          key: "id",
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "User ID if authenticated, null for anonymous users",
      },
      messageContent: {
        type: DataTypes.JSON,
        allowNull: false,
        comment:
          'Message content in OpenAI format: {role: "user"|"assistant"|"system", content: "message"}',
        validate: {
          isValidMessageFormat(value) {
            if (!value || typeof value !== "object") {
              throw new Error("messageContent must be a valid object");
            }
            if (!value.role || !value.content) {
              throw new Error(
                "messageContent must have role and content properties"
              );
            }
            if (!["user", "assistant", "system"].includes(value.role)) {
              throw new Error("role must be one of: user, assistant, system");
            }
          },
        },
      },
      agentName: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: "Name of the agent that handled this message",
      },
      messageType: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "user",
        comment: "Type of message: user, assistant, system",
        validate: {
          isIn: [["user", "assistant", "system"]],
        },
      },
      confidence: {
        type: DataTypes.FLOAT,
        allowNull: true,
        comment: "Classification confidence score for agent selection",
        validate: {
          min: 0,
          max: 1,
        },
      },
      classificationMethod: {
        type: DataTypes.STRING(30),
        allowNull: true,
        comment:
          "Method used for classification: pattern_matching, keyword_matching, llm_classification",
      },
      estimatedCost: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true,
        defaultValue: 0,
        comment: "Estimated cost of processing this message",
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Additional metadata about the message processing",
      },
    },
    {
      sequelize,
      modelName: "ChatHistory",
      tableName: "chatbot-histories",
      indexes: [
        { fields: ["sessionId"] },
        { fields: ["userId"] },
        { fields: ["sessionId", "createdAt"] },
        { fields: ["messageType"] },
        { fields: ["agentName"] },
        { fields: ["createdAt"] },
      ],
    }
  );

  return ChatHistory;
};
