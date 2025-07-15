"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {
    static associate(models) {
      Tag.belongsToMany(models.Post, {
        through: "post_topic",
        foreignKey: "tagId",
        otherKey: "postId",
        as: "posts",
      });
    }
  }
  Tag.init(
    {
      name: DataTypes.STRING(191),

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Tag",
      tableName: "tags",
      timestamps: true,
    }
  );
  return Tag;
};
