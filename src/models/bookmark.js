"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Bookmark extends Model {
    static associate(models) {
      Bookmark.belongsTo(models.User, { foreignKey: "userId" });
      Bookmark.belongsTo(models.Post, { foreignKey: "postId" });
    }
  }
  Bookmark.init(
    {
      userId: DataTypes.INTEGER,

      postId: DataTypes.INTEGER,

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Bookmark",
      tableName: "bookmarks",
      timestamps: true,
    }
  );
  return Bookmark;
};
