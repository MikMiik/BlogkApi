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
      Post.belongsToMany(models.Tag, {
        through: "post_tag",
        foreignKey: "postId",
        otherKey: "tagId",
        as: "tags",
      });
      Post.hasMany(models.Like, {
        foreignKey: "likableId",
        constraints: false,
        scope: {
          likableType: "Post",
        },
        as: "likes",
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

      isLiked: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue("isLiked");
        },
        set(value) {
          this.setDataValue("isLiked", value);
        },
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

  Post.addHook("afterFind", async (result, options) => {
    const userId = options.userId;
    const { Like } = sequelize.models;

    // Nếu không có userId → set tất cả isLiked = false
    if (!userId) {
      if (Array.isArray(result)) {
        result.forEach((post) => {
          post.setDataValue("isLiked", false);
        });
      } else if (result && result.id) {
        result.setDataValue("isLiked", false);
      }
      return;
    }

    // Có userId → xử lý như thường
    if (Array.isArray(result)) {
      const postIds = result.map((post) => post.id);

      const likes = await Like.findAll({
        where: {
          userId,
          likableType: "Post",
          likableId: postIds,
        },
      });

      const likedIds = new Set(likes.map((l) => l.likableId));

      result.forEach((post) => {
        post.setDataValue("isLiked", likedIds.has(post.id));
      });
    } else if (result && result.id) {
      const like = await Like.findOne({
        where: {
          userId,
          likableType: "Post",
          likableId: result.id,
        },
      });

      result.setDataValue("isLiked", !!like);
    }
  });

  return Post;
};
