"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Notification_User extends Model {
    static associate(models) {
      // define association here
    }
  }
  Notification_User.init(
    {
      userId: DataTypes.INTEGER.UNSIGNED,

      notificaitonId: DataTypes.INTEGER.UNSIGNED,

      type: DataTypes.STRING(191),

      seenAt: DataTypes.DATE,

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Notification_User",
      tableName: "notification_user",
      timestamps: true,
    }
  );
  return Notification_User;
};
