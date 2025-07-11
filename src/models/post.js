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
      userId: { type: DataTypes.INTEGER },

      title: DataTypes.STRING(255),

      description: DataTypes.TEXT,

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
      // defaultScope: {
      //   attributes: {
      //     exclude: ["UserId"],
      //   },
      // },
      hooks: {
        beforeCreate: async (post, options) => {
          if (post.title) {
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
