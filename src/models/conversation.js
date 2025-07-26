"use strict";
const { Model } = require("sequelize");
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

      lastMessageAt: DataTypes.DATE,

      lastMessage: {
        type: DataTypes.VIRTUAL,
        get() {
          const messages = this.getDataValue("messages") || [];
          return messages[messages.length - 1] || null;
        },
      },

      isOnline: {
        type: DataTypes.VIRTUAL,
        get() {
          const participants = this.getDataValue("participants") || [];
          const creatorId = this.getDataValue("creatorId");

          return participants.some(
            (user) => user.id !== creatorId && user.status === "online"
          );
        },
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
  return Conversation;
};
