"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Conversation_Participant extends Model {
    static associate(models) {
      // define association here
    }
  }
  Conversation_Participant.init(
    {
      conversationId: {
        type: DataTypes.INTEGER,
      },

      userId: {
        type: DataTypes.INTEGER,
      },

      role: {
        type: DataTypes.STRING,
        defaultValue: "member",
      },

      joinedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },

      unreadCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Conversation_Participant",
      tableName: "conversation_participants",
      timestamps: true,
    }
  );
  return Conversation_Participant;
};
