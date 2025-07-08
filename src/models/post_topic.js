"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Post_Topic extends Model {
    static associate(models) {
      // define association here
    }
  }
  Post_Topic.init(
    {
      postId: DataTypes.INTEGER.UNSIGNED,

      topicId: DataTypes.INTEGER.UNSIGNED,

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Post_Topic",
      tableName: "post_topic",
      timestamps: true,
    }
  );
  return Post_Topic;
};
