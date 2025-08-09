"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ChatbotConversation extends Model {
    static associate(models) {
      // Association with User
      ChatbotConversation.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });

      // Association with ChatHistory
      ChatbotConversation.hasMany(models.ChatHistory, {
        foreignKey: "conversationId",
        as: "messages",
      });

      // Alternative association through sessionId for backward compatibility
      ChatbotConversation.hasMany(models.ChatHistory, {
        foreignKey: "sessionId",
        sourceKey: "sessionId",
        as: "messagesBySession",
      });
    }

    // Instance methods
    async updateActivity() {
      return await this.update({
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      });
    }

    async incrementMessageCount() {
      return await this.increment("messageCount", {
        by: 1,
      }).then(() => {
        return this.update({
          lastMessageAt: new Date(),
          updatedAt: new Date(),
        });
      });
    }

    async updateTitle(title) {
      return await this.update({
        title: title.substring(0, 500), // Limit title length
        updatedAt: new Date(),
      });
    }

    async deactivate() {
      return await this.update({
        isActive: false,
        updatedAt: new Date(),
      });
    }
  }

  ChatbotConversation.init(
    {
      sessionId: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      title: {
        type: DataTypes.STRING(500),
        allowNull: true,
        defaultValue: "New Conversation",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      lastMessageAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      messageCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "ChatbotConversation",
      tableName: "chatbot_conversations",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["sessionId"],
        },
        {
          fields: ["userId"],
        },
        {
          fields: ["userId", "isActive"],
        },
        {
          fields: ["lastMessageAt"],
          order: [["lastMessageAt", "DESC"]],
        },
      ],
    }
  );

  // Static methods
  ChatbotConversation.findBySessionId = async function (sessionId) {
    return await this.findOne({
      where: { sessionId },
    });
  };

  ChatbotConversation.findUserConversations = async function (
    userId,
    options = {}
  ) {
    const { limit = 20, offset = 0, includeInactive = false } = options;

    const whereClause = { userId };
    if (!includeInactive) {
      whereClause.isActive = true;
    }

    return await this.findAll({
      where: whereClause,
      order: [["updatedAt", "DESC"]],
      limit,
      offset,
      include: [
        {
          association: "messages",
          limit: 1,
          order: [["createdAt", "DESC"]],
        },
      ],
    });
  };

  ChatbotConversation.createConversation = async function (
    sessionId,
    userId = null,
    title = null
  ) {
    return await this.create({
      sessionId,
      userId,
      title: title || "New Conversation",
      isActive: true,
    });
  };

  ChatbotConversation.findOrCreateUserConversation = async function (
    userId,
    sessionId = null
  ) {
    if (sessionId) {
      // Try to find existing conversation
      const existing = await this.findBySessionId(sessionId);
      if (existing && existing.userId === userId) {
        return existing;
      }
    }

    // Create new conversation
    const newSessionId =
      sessionId ||
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return await this.createConversation(newSessionId, userId);
  };

  ChatbotConversation.getActiveUserConversation = async function (userId) {
    return await this.findOne({
      where: {
        userId,
        isActive: true,
      },
      order: [["updatedAt", "DESC"]],
    });
  };

  ChatbotConversation.deactivateUserConversations = async function (userId) {
    return await this.update(
      {
        isActive: false,
        updatedAt: new Date(),
      },
      {
        where: { userId },
      }
    );
  };

  return ChatbotConversation;
};
