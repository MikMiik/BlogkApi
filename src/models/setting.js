"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Setting extends Model {
    static associate(models) {
      // define association here
      Setting.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }
  Setting.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
      },

      email: { type: DataTypes.STRING(100), unique: true },

      // Account settings
      twoFactorEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      twoFactorSecret: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },

      // Content settings
      defaultPostVisibility: {
        type: DataTypes.STRING(20),
        defaultValue: "public",
      },
      allowComments: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      showViewCounts: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      // Notification settings
      notiNewComments: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      notiNewFollowers: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      notiNewLikes: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      notiWeeklyDigest: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      // Privacy settings
      profileVisibility: {
        type: DataTypes.STRING(20),
        defaultValue: "public",
      },
      searchEngineIndexing: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Setting",
      tableName: "settings",
      timestamps: true,
    }
  );
  return Setting;
};
