"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      Post.belongsTo(models.User, { as: "author", foreignKey: "userId" });
      Post.hasMany(models.Comment, {
        foreignKey: "commentableId",
        constraints: false,
        scope: {
          commentableType: "Post",
        },
        as: "comments",
      });
      Post.hasMany(models.Image, {
        as: "images",
      });
      Post.belongsToMany(models.Topic, {
        through: "post_topic",
        foreignKey: "postId",
        otherKey: "topicId",
        as: "topics",
      });
    }
  }
  Post.init(
    {
      userId: { type: DataTypes.INTEGER },

      title: DataTypes.STRING(255),

      description: DataTypes.TEXT,

      excerpt: DataTypes.TEXT,

      slug: {
        type: DataTypes.STRING(191),
        unique: true,
      },

      content: DataTypes.TEXT,

      readTime: DataTypes.INTEGER,

      thumbnail: DataTypes.STRING(255),

      status: {
        type: DataTypes.STRING(50),
        defaultValue: "Draft",
      },

      metaTitle: DataTypes.STRING(255),

      metaDescription: DataTypes.TEXT,

      visibility: {
        type: DataTypes.STRING(50),
        defaultValue: "Public",
      },

      visibilityIcon: DataTypes.STRING(255),

      allowComments: DataTypes.BOOLEAN,

      viewsCount: DataTypes.INTEGER,

      likesCount: DataTypes.INTEGER,

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
      hooks: {
        beforeCreate: async (post, options) => {
          if (post.title && !post.slug) {
            const baseSlug = slugify(post.title, {
              lower: true,
              strict: true,
            });
            let slug = baseSlug;
            let counter = 1;
            const existingSlug = await Post.findOne({
              where: { slug },
            });
            while (existingSlug) {
              slug = `${baseSlug}-${counter}`;
              counter++;

              const exists = await Post.findOne({
                where: { slug },
              });

              if (!exists) break;
            }
            post.slug = slug;
          }
        },
      },
    }
  );
  return Post;
};
