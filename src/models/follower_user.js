"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Follower_User extends Model {
    static associate(models) {
      // define association here
    }
  }
  Follower_User.init(
    {
      userId: DataTypes.INTEGER.UNSIGNED,

      followerId: DataTypes.INTEGER.UNSIGNED,

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Follower_User",
      tableName: "follower_user",
      timestamps: true,
    }
  );
  return Follower_User;
};
