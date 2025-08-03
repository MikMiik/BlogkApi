"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Notification_User extends Model {
    static associate(models) {
      // define association here
      Notification_User.belongsTo(models.Notification, {
        foreignKey: "notificationId",
        as: "notification",
      });
      Notification_User.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }
  Notification_User.init(
    {
      userId: DataTypes.INTEGER,

      notificationId: DataTypes.INTEGER,

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
