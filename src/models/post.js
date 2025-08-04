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

      thumbnail: {
        type: DataTypes.STRING(255),
        get() {
          const raw = this.getDataValue("thumbnail");
          if (!raw) return null;
          return raw.startsWith("http")
            ? raw
            : `${process.env.BASE_URL}/${raw}`;
        },
      },

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
    }
  );

  // Create slug
  Post.addHook("beforeCreate", async (post) => {
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
  });
  // Handle isliked and isBookmarked
  Post.addHook("afterFind", async (result, options) => {
    if (options?.skipHandleIsLiked) return;
    const userId = getCurrentUser();

    const { Like, Bookmark } = sequelize.models;

    const posts = Array.isArray(result) ? result : result ? [result] : [];
    if (posts.length === 0) return;
    if (!userId) {
      posts.forEach((p) => p.setDataValue("isLiked", false));
      posts.forEach((p) => p.setDataValue("isBookmarked", false));
    } else {
      const postIds = posts.map((p) => p.id);

      const likes = await Like.findAll({
        where: {
          userId,
          likableType: "Post",
          likableId: postIds,
        },
      });

      const bookmarks = await Bookmark.findAll({
        where: {
          userId,
          postId: postIds,
        },
      });

      const likedIds = new Set(likes.map((l) => l.likableId));
      const bookmarkedIds = new Set(bookmarks.map((b) => b.postId));

      posts.forEach((p) => {
        p.setDataValue("isLiked", likedIds.has(p.id));
        p.setDataValue("isBookmarked", bookmarkedIds.has(p.id));
      });
    }
  });

  // Handle user settings filter (view counts, etc.)
  Post.addHook("afterFind", async (result, options) => {
    // Skip nếu là internal query hoặc edit mode
    if (options?.skipSettingsFilter || options?.skipHandleIsLiked) return;

    const currentUserId = getCurrentUser();
    if (!currentUserId) return; // Không filter cho guest users

    const posts = Array.isArray(result) ? result : result ? [result] : [];
    if (posts.length === 0) return;

    try {
      // Import setting service dynamically để tránh circular dependency
      const settingService = require("@/services/setting.service");

      // Get unique author IDs
      const authorIds = [
        ...new Set(posts.map((p) => p.userId).filter(Boolean)),
      ];
      if (authorIds.length === 0) return;

      // Batch query settings để optimize performance
      const settingsMap = new Map();
      await Promise.all(
        authorIds.map(async (authorId) => {
          const settings = await settingService.getUserSettings(authorId);
          settingsMap.set(authorId, settings);
        })
      );

      // Apply settings filter
      posts.forEach((post) => {
        if (!post.userId) return;

        const authorSettings = settingsMap.get(post.userId);
        if (!authorSettings) return;

        // Hide view count if author doesn't allow and viewer is not the author
        if (!authorSettings.showViewCounts && currentUserId !== post.userId) {
          post.setDataValue("viewsCount", null);
        }
      });
    } catch (error) {
      // Log error but don't break the query
      console.error("Error applying settings filter in Post hook:", error);
    }
  });

  // Increase postCount
  Post.addHook("afterCreate", async (post) => {
    if (post) {
      const { User } = sequelize.models;
      await User.increment("postsCount", {
        by: 1,
        where: { id: post.userId },
      });
    }
  });

  // Decrease postCount
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
