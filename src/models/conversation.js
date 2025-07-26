"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    static associate(models) {
      Conversation.hasMany(models.Message, {
        as: "messages",
      });
      Conversation.hasMany(models.Message, {
        as: "lastMessage",
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

      avatar: DataTypes.STRING(255),

      type: DataTypes.STRING(50),

      lastMessageAt: DataTypes.DATE,

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

  Conversation.addHook("afterFind", (result, options) => {
    const handleConversation = (conv) => {
      if (
        conv &&
        Array.isArray(conv.participants) &&
        conv.participants.length === 1
      ) {
        conv.setDataValue("participant", conv.participants[0]);
      }
    };

    if (Array.isArray(result)) {
      result.forEach(handleConversation);
    } else {
      handleConversation(result);
    }

    return result;
  });
  return Conversation;
};
