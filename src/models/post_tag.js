"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Post_Tag extends Model {
    static associate(models) {
      // define association here
    }
  }
  Post_Tag.init(
    {
      postId: DataTypes.INTEGER.UNSIGNED,

      tagId: DataTypes.INTEGER.UNSIGNED,

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Post_Tag",
      tableName: "post_tag",
      timestamps: true,
    }
  );
  return Post_Tag;
};
