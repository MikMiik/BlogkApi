"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Achievement_User extends Model {
    static associate(models) {
      // define association here
    }
  }
  Achievement_User.init(
    {
      achievementId: DataTypes.INTEGER.UNSIGNED,

      userId: DataTypes.INTEGER.UNSIGNED,

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Achievement_User",
      tableName: "achievement_user",
      timestamps: true,
    }
  );
  return Achievement_User;
};
