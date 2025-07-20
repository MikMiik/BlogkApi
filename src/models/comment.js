"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      Comment.belongsTo(models.Post, {
        foreignKey: "commentableId",
        constraints: false,
        as: "post",
      });
      Comment.belongsTo(models.User, { as: "commenter", foreignKey: "userId" });
      Comment.hasMany(Comment, {
        as: "replies",
        foreignKey: "parentId",
      });
      Comment.belongsTo(Comment, {
        as: "parent",
        foreignKey: "parentId",
      });
      Comment.hasMany(models.Like, {
        foreignKey: "likableId",
        constraints: false,
        scope: {
          likableType: "Comment",
        },
        as: "likes",
      });
    }
  }
  Comment.init(
    {
      userId: DataTypes.INTEGER,

      parentId: DataTypes.INTEGER,

      content: DataTypes.TEXT,

      commentableId: DataTypes.INTEGER,

      commentableType: DataTypes.STRING(191),

      likesCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      isLiked: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue("isLiked");
        },
        set(value) {
          this.setDataValue("isLiked", value);
        },
      },

      isEdited: DataTypes.BOOLEAN,

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Comment",
      tableName: "comments",
      timestamps: true,
    }
  );

  Comment.addHook("afterFind", async (result, options) => {
    const userId = options.userId;
    const { Like } = sequelize.models;

    // Nếu không có userId → set tất cả isLiked = false
    if (!userId) {
      if (Array.isArray(result)) {
        result.forEach((comment) => {
          comment.setDataValue("isLiked", false);
        });
      } else if (result && result.id) {
        result.setDataValue("isLiked", false);
      }
      return;
    }

    // Có userId → xử lý như thường
    if (Array.isArray(result)) {
      const commentIds = result.map((comment) => comment.id);

      const likes = await Like.findAll({
        where: {
          userId,
          likableType: "Comment",
          likableId: commentIds,
        },
      });

      const likedIds = new Set(likes.map((l) => l.likableId));

      result.forEach((comment) => {
        comment.setDataValue("isLiked", likedIds.has(comment.id));
      });
    } else if (result && result.id) {
      const like = await Like.findOne({
        where: {
          userId,
          likableType: "Comment",
          likableId: result.id,
        },
      });

      result.setDataValue("isLiked", !!like);
    }
  });
  return Comment;
};
