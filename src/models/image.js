"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    static associate(models) {
      Image.belongsTo(models.Post, { as: "images", foreignKey: "postId" });
    }
  }
  Image.init(
    {
      postId: DataTypes.INTEGER.UNSIGNED,

      url: DataTypes.STRING(191),

      altText: DataTypes.STRING(191),

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Image",
      tableName: "images",
      timestamps: true,
    }
  );
  return Image;
};
