"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsToMany(models.User, {
        through: "notification_user",
        foreignKey: "notificationId",
        otherKey: "userId",
        as: "users",
      });
    }
  }
  Notification.init(
    {
      type: DataTypes.STRING(50),

      notifiableType: DataTypes.STRING(100),

      notifiableId: DataTypes.INTEGER,

      link: {
        type: DataTypes.STRING(255),
        get() {
          const raw = this.getDataValue("link");
          if (!raw) return null;
          return raw.startsWith("http")
            ? raw
            : `${process.env.CLIENT_URL}${raw}`;
        },
      },
      seenAt: DataTypes.DATE,

      content: DataTypes.TEXT,

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,

      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Notification",
      tableName: "notifications",
      timestamps: true,
      paranoid: true,
    }
  );

  return Notification;
};
