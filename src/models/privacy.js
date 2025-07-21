"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Privacy extends Model {
    static associate(models) {
      Privacy.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  Privacy.init(
    {
      userId: {
        type: DataTypes.INTEGER,
      },
      profileVisibility: {
        type: DataTypes.STRING(50),
        defaultValue: "Public",
      },
      showEmail: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      showFollowersCount: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      showFollowingCount: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      allowDirectMessages: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      showOnlineStatus: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Privacy",
      tableName: "user-privacy-settings",
      timestamps: true,
    }
  );
  return Privacy;
};
