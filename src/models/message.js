"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.User, { as: "author", foreignKey: "userId" });
    }
  }
  Message.init(
    {
      userId: {
        type: DataTypes.INTEGER,
      },
      conversationId: {
        type: DataTypes.INTEGER,
      },
      type: {
        type: DataTypes.STRING(50),
        defaultValue: "text",
      },
      content: DataTypes.TEXT,
      status: {
        type: DataTypes.STRING(50),
        defaultValue: "sent",
      },
      deletedAt: DataTypes.DATE,

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Message",
      tableName: "messages",
      timestamps: true,
      paranoid: true,
    }
  );
  return Message;
};
