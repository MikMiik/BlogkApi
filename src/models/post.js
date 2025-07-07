"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      // define association here
    }
  }
  Post.init(
    {
      userId: { type: DataTypes.INTEGER.UNSIGNED, unique: true },

      topic: DataTypes.STRING(191),

      title: DataTypes.STRING(191),

      slug: {
        type: DataTypes.STRING(191),
        unique: true,
        allowNull: false,
        defaultValue: "user",
      },

      content: {
        type: DataTypes.TEXT,
      },

      readTime: DataTypes.INTEGER.UNSIGNED,

      thumbnail: DataTypes.STRING(191),

      status: DataTypes.STRING(191),

      metaTitle: DataTypes.STRING(191),

      metaDescription: DataTypes.STRING(191),

      visibility: {
        type: DataTypes.ENUM("Public", "Followers only", "Only me"),
        defaultValue: "Public",
      },

      visibilityIcon: DataTypes.STRING(191),

      allowComments: DataTypes.BOOLEAN,

      publishedAt: DataTypes.DATE,

      draftedAt: DataTypes.DATE,

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Post",
      tableName: "posts",
      timestamps: true,
      defaultScope: {
        attributes: {
          exclude: ["UserId"],
        },
      },
      hooks: {
        beforeCreate: (post, options) => {
          if (post.title) {
            post.slug = slugify(post.title, { lower: true, strict: true });
          }
        },
      },
    }
  );
  return Post;
};
