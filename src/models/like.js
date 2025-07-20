"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    static associate(models) {
      Like.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  Like.init(
    {
      userId: DataTypes.INTEGER,

      likableId: DataTypes.INTEGER,

      likableType: DataTypes.STRING(255),

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Like",
      tableName: "likes",
      timestamps: true,
    }
  );

  Like.addHook("afterCreate", async (like, options) => {
    if (like.likableType === "Post") {
      const { Post } = sequelize.models;
      await Post.increment("likesCount", {
        by: 1,
        where: { id: like.likableId },
      });
    }
    if (like.likableType === "Comment") {
      const { Comment } = sequelize.models;
      await Comment.increment("likesCount", {
        by: 1,
        where: { id: like.likableId },
      });
    }
  });

  Like.addHook("afterDestroy", async (like, options) => {
    if (like.likableType === "Post") {
      const { Post } = sequelize.models;
      await Post.decrement("likesCount", {
        by: 1,
        where: { id: like.likableId },
      });
    }
    if (like.likableType === "Comment") {
      const { Comment } = sequelize.models;
      await Comment.decrement("likesCount", {
        by: 1,
        where: { id: like.likableId },
      });
    }
  });

  return Like;
};
