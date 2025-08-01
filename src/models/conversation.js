"use strict";
const getCurrentUser = require("@/utils/getCurrentUser");
const { Model } = require("sequelize");
const baseURL = process.env.BASE_URL || "http://localhost:3000";

module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    static associate(models) {
      Conversation.hasMany(models.Message, {
        as: "messages",
        foreignKey: "conversationId",
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

      type: {
        type: DataTypes.STRING(50),
        defaultValue: "private",
      },

      creatorId: {
        type: DataTypes.INTEGER,
      },

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
      paranoid: true,
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

    conversations.forEach((conv) => {
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
