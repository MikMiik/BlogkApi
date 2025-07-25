"use strict";
const getCurrentUser = require("@/utils/getCurrentUser");
const { Model, Op } = require("sequelize");
const { default: slugify } = require("slugify");
const baseURL = process.env.BASE_URL || "http://localhost:3000";

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
      Post.belongsToMany(models.Bookmark, {
        through: "bookmarks",
        foreignKey: "postId",
        otherKey: "userId",
        as: "bookmarksPosts",
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
        defaultValue: "draft",
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

      isBookmarked: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue("isBookmarked");
        },
        set(value) {
          this.setDataValue("isBookmarked", value);
        },
      },

      metaTitle: DataTypes.STRING(255),

      metaDescription: DataTypes.TEXT,

      visibility: {
        type: DataTypes.STRING(50),
        defaultValue: "public",
      },

      allowComments: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },

      viewsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      likesCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

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
      scopes: {
        onlyPublished: {
          where: {
            publishedAt: {
              [Op.lte]: sequelize.literal("CURRENT_TIMESTAMP"),
            },
            status: "published",
          },
        },
      },
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

  Post.addHook("afterFind", async (result) => {
    const { id: userId } = getCurrentUser();

    const { Like } = sequelize.models;

    if (!userId) {
      if (result && result.posts && Array.isArray(result.posts)) {
        result.posts.forEach((post) => {
          post.setDataValue("isLiked", false);
        });
      } else if (Array.isArray(result)) {
        result.forEach((post) => {
          post.setDataValue("isLiked", false);
        });
      } else if (result && result.id) {
        result.setDataValue("isLiked", false);
      }
      return;
    }

    // Có userId → xử lý như thường
    if (result && result.posts && Array.isArray(result.posts)) {
      const postIds = result.posts.map((post) => post.id);

      const likes = await Like.findAll({
        where: {
          userId,
          likableType: "Post",
          likableId: postIds,
        },
      });

      const likedIds = new Set(likes.map((l) => l.likableId));

      result.posts.forEach((post) => {
        post.setDataValue("isLiked", likedIds.has(post.id));
      });
    } else if (Array.isArray(result)) {
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

  Post.addHook("afterFind", async (result) => {
    const { id: userId } = getCurrentUser();
    const { Bookmark } = sequelize.models;

    if (!userId) {
      if (Array.isArray(result)) {
        result.forEach((post) => {
          post.setDataValue("isBookmarked", false);
        });
      } else if (result && result.id) {
        result.setDataValue("isBookmarked", false);
      }
      return;
    }

    // Có userId → xử lý như thường
    if (Array.isArray(result)) {
      const postIds = result.map((post) => post.id);

      const bookmarks = await Bookmark.findAll({
        where: {
          userId,
          postId: postIds,
        },
      });

      const bookmarkedIds = new Set(bookmarks.map((b) => b.postId));

      result.forEach((post) => {
        post.setDataValue("isBookmarked", bookmarkedIds.has(post.id));
      });
    } else if (result && result.id) {
      const bookmark = await Bookmark.findOne({
        where: {
          userId,
          postId: result.id,
        },
      });

      result.setDataValue("isBookmarked", !!bookmark);
    }
  });

  Post.addHook("afterFind", (result) => {
    const patchPostCoverImage = (post) => {
      if (post.thumbnail && !post.thumbnail.startsWith("http")) {
        post.thumbnail = `${baseURL}/${post.thumbnail}`;
      }
    };

    if (Array.isArray(result)) {
      result.forEach(patchPostCoverImage);
    } else if (result) {
      patchPostCoverImage(result);
    }
  });

  Post.addHook("afterFind", (result) => {
    const patchPostAuthorAvatar = (post) => {
      if (post?.author?.avatar && !post?.author?.avatar.startsWith("http")) {
        post.author.avatar = `${baseURL}/${post.author.avatar}`;
      }
    };

    if (Array.isArray(result)) {
      result.forEach(patchPostAuthorAvatar);
    } else if (result) {
      patchPostAuthorAvatar(result);
    }
  });

  Post.addHook("afterCreate", async (post) => {
    if (post) {
      const { User } = sequelize.models;
      await User.increment("postsCount", {
        by: 1,
        where: { id: post.userId },
      });
    }
  });

  Post.addHook("afterDestroy", async (post, options) => {
    if (post) {
      const { User } = sequelize.models;
      await User.decrement("postsCount", {
        by: 1,
        where: { id: post.userId },
      });
    }
  });

  return Post;
};
