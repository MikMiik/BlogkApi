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
  return Comment;
};
