"use strict";
const getCurrentUser = require("@/utils/getCurrentUser");
const { Model } = require("sequelize");
const baseURL = process.env.BASE_URL || "http://localhost:3000";

module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    static associate(models) {
      Conversation.hasMany(models.Message, {
        as: "messages",
      });

      Conversation.belongsToMany(models.User, {
        through: "conversation_participants",
        foreignKey: "conversationId",
        otherKey: "userId",
        as: "participants",
      });
    }
  }
  Conversation.init(
    {
      name: DataTypes.STRING(50),

      avatar: DataTypes.STRING(255),

      type: DataTypes.STRING(50),

      isOnline: {
        type: DataTypes.VIRTUAL,
        get() {
          const participants = this.getDataValue("participants") || [];
          const creatorId = this.getDataValue("creatorId");

          return participants.some(
            (user) =>
              user.id !== creatorId && user.status === ("Active" || "Online")
          );
        },
      },

      lastMessage: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue("lastMessage");
        },
        set(value) {
          this.setDataValue("lastMessage", value);
        },
      },

      isGroup: {
        type: DataTypes.VIRTUAL,
        get() {
          const participants = this.getDataValue("participants") || [];
          return participants.length > 2;
        },
      },

      groupAvatar: {
        type: DataTypes.STRING(255),
      },
      groupName: {
        type: DataTypes.STRING(50),
      },

      createdAt: DataTypes.DATE,

      deletedAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Conversation",
      tableName: "conversations",
      timestamps: true,
    }
  );

  Conversation.addHook("afterFind", async (result, options) => {
    const userId = getCurrentUser();
    const conversations = Array.isArray(result)
      ? result
      : result
        ? [result]
        : [];
    if (conversations.length === 0) return result;

    // Lấy model Message từ sequelize.models
    const Message = sequelize.models.Message;

    // Lấy tất cả conversationId
    const conversationIds = conversations.map((c) => c.id);

    // Lấy message mới nhất cho mỗi conversation
    const lastMessages = await Message.findAll({
      where: { conversationId: conversationIds },
      order: [
        ["conversationId", "ASC"],
        ["createdAt", "DESC"],
      ],
      attributes: ["content", "createdAt", "conversationId"],
      raw: true,
    });

    // Map conversationId -> lastMessage
    const lastMessageMap = {};
    for (const msg of lastMessages) {
      if (!lastMessageMap[msg.conversationId]) {
        lastMessageMap[msg.conversationId] = {
          content: msg.content,
          createdAt: msg.createdAt,
        };
      }
    }

    conversations.forEach((conv) => {
      // Set lastMessage
      conv.setDataValue("lastMessage", lastMessageMap[conv.id] || null);

      // Set participant nếu là chat 2 người
      const participants = conv.getDataValue("participants") || [];
      if (participants.length === 2 && userId) {
        const other = participants.find((u) => u.id !== userId);
        if (other) {
          conv.setDataValue("participant", other);
        }
      }
    });

    return result;
  });

  return Conversation;
};
