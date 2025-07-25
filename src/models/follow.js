"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Follow extends Model {
    static associate(models) {
      // define association here
    }
  }
  Follow.init(
    {
      followedId: DataTypes.INTEGER.UNSIGNED,

      followerId: DataTypes.INTEGER.UNSIGNED,

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Follow",
      tableName: "follows",
      timestamps: true,
    }
  );

  Follow.addHook("afterCreate", async (follow) => {
    if (follow) {
      const { User } = sequelize.models;
      await User.increment("followingCount", {
        by: 1,
        where: { id: follow.followerId },
      });
      await User.increment("followersCount", {
        by: 1,
        where: { id: follow.followedId },
      });
    }
  });

  Follow.addHook("afterDestroy", async (follow, options) => {
    if (follow) {
      const { User } = sequelize.models;
      await User.decrement("followingCount", {
        by: 1,
        where: { id: follow.followerId },
      });
      await User.decrement("followersCount", {
        by: 1,
        where: { id: follow.followedId },
      });
    }
  });

  return Follow;
};
