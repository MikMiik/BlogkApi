"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      // define association here
    }
  }
  Comment.init(
    {
      userId: DataTypes.INTEGER.UNSIGNED,

      parentId: DataTypes.INTEGER.UNSIGNED,

      content: DataTypes.TEXT,

      commentableId: DataTypes.INTEGER.UNSIGNED,

      commentableType: DataTypes.STRING(191),

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
