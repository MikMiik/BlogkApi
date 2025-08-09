const {
  Post,
  User,
  Comment,
  Topic,
  Image,
  Tag,
  Like,
  Bookmark,
  sequelize,
  Setting,
} = require("@/models");
const getCurrentUser = require("@/utils/getCurrentUser");
const handlePostTopic = require("@/utils/handlePostTopic");
const { Op } = require("sequelize");
const notificationService = require("./notification.service");
class PostsService {
  // Getter for current user ID - more concise
  get userId() {
    return getCurrentUser();
  }

  async getAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { rows: posts, count } = await Post.scope(
      "onlyPublished"
    ).findAndCountAll({
      limit,
      offset,
      order: [["publishedAt", "DESC"]],
      attributes: [
        "id",
        "title",
        "slug",
        "status",
        "content",
        "excerpt",
        "readTime",
        "thumbnail",
        "viewsCount",
        "likesCount",
        "createdAt",
        "publishedAt",
        "userId", // Required for settings filter
      ],
      include: [
        {
          model: User,
          as: "author",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "avatar",
            "isFollowed",
            "website",
            "socials",
            "name",
          ],
        },
        {
          model: Topic,
          as: "topics",
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
    });

    const featuredPosts = await Post.scope("onlyPublished").findAll({
      order: [["viewsCount", "DESC"]],
      limit: 10,
      attributes: [
        "id",
        "title",
        "slug",
        "status",
        "content",
        "excerpt",
        "readTime",
        "thumbnail",
        "viewsCount",
        "likesCount",
        "publishedAt",
        "userId", // Required for settings filter
      ],
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "firstName", "lastName", "avatar", "name"],
        },
        {
          model: Topic,
          as: "topics",
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
    });

    const latestPosts = await Post.scope("onlyPublished").findAll({
      order: [["publishedAt", "DESC"]],
      limit: 10,
      attributes: [
        "id",
        "title",
        "slug",
        "status",
        "content",
        "excerpt",
        "readTime",
        "thumbnail",
        "viewsCount",
        "likesCount",
        "publishedAt",
        "userId", // Required for settings filter
      ],
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "firstName", "lastName", "avatar", "name"],
        },
        {
          model: Topic,
          as: "topics",
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
    });

    return {
      posts,
      count,
      featuredPosts,
      latestPosts,
    };
  }

  async getById(idOrSlug) {
    const post = await Post.scope("onlyPublished").findOne({
      where: {
        [Op.or]: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      attributes: [
        "id",
        "title",
        "userId",
        "content",
        "status",
        "thumbnail",
        "readTime",
        "viewsCount",
        "likesCount",
        "publishedAt",
        "updatedAt",
      ],
      include: [
        {
          model: Topic,
          as: "topics",
          attributes: ["name"],
          through: { attributes: [] },
        },
        {
          model: Tag,
          as: "tags",
          attributes: ["name"],
          through: { attributes: [] },
        },
        {
          model: Image,
          as: "images",
          attributes: ["url", "altText"],
        },
      ],
    });

    if (post) {
      const user = await User.findOne({
        where: { id: post.userId },
        attributes: [
          "id",
          "firstName",
          "lastName",
          "role",
          "website",
          "socials",
          "avatar",
          "username",
          "name",
          "introduction",
          "postsCount",
          "isFollowed",
          "followersCount",
          "followingCount",
        ],
        include: [
          {
            model: Setting,
            as: "setting",
            attributes: ["allowComments", "showViewCounts"],
          },
        ],
      });

      // Attach user to post
      post.setDataValue("author", user);
    }

    const { rows: comments, count: commentsCount } =
      await Comment.findAndCountAll({
        where: {
          commentableId: post.id,
          commentableType: "Post",
        },
        attributes: [
          "id",
          "parentId",
          "content",
          "isEdited",
          "likesCount",
          "createdAt",
          "updatedAt",
        ],
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: User,
            as: "commenter",
            attributes: [
              "id",
              "firstName",
              "username",
              "lastName",
              "avatar",
              "name",
            ],
          },
        ],
      });

    let relatedPosts = [];
    if (post && post.topics && post.topics.length > 0) {
      const topicNames = post.topics.map((topic) => topic.name);
      relatedPosts = await Post.scope("onlyPublished").findAll({
        attributes: [
          "id",
          "title",
          "slug",
          "status",
          "content",
          "excerpt",
          "readTime",
          "thumbnail",
          "viewsCount",
          "likesCount",
          "publishedAt",
          "userId", // Required for settings filter
        ],
        include: [
          {
            model: Topic,
            as: "topics",
            attributes: ["name"],
            where: {
              name: {
                [Op.in]: topicNames,
              },
            },
            through: { attributes: [] },
          },
          {
            model: User,
            as: "author",
            attributes: ["id", "firstName", "lastName", "avatar", "name"],
          },
        ],
        where: {
          id: {
            [Op.ne]: post.id, // ne = not equal
          },
        },
        limit: 20,
        order: [["publishedAt", "DESC"]],
        distinct: true,
      });
    }

    return {
      post,
      relatedPosts,
      comments,
      commentsCount,
    };
  }

  async getPostToEdit(idOrSlug) {
    // Skip settings filter for edit operations
    const post = await Post.unscoped().findOne({
      where: {
        [Op.or]: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      attributes: [
        "id",
        "title",
        "content",
        "status",
        "excerpt",
        "visibility",
        "thumbnail",
        "readTime",
        "metaTitle",
        "metaDescription",
        "viewsCount",
        "likesCount",
        "publishedAt",
        "updatedAt",
      ],
      include: [
        {
          model: Topic,
          as: "topics",
          attributes: ["name"],
          through: { attributes: [] },
        },
        {
          model: Tag,
          as: "tags",
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
      skipSettingsFilter: true, // Bypass settings filter for editing
    });
    return post;
  }

  async getBookmarkPosts() {
    const bookmarks = await Bookmark.findAll({
      where: {
        userId: this.userId,
      },
    });

    const posts = await Post.findAll({
      where: {
        id: bookmarks.map((bookmark) => bookmark.postId),
      },
      attributes: [
        "id",
        "title",
        "content",
        "status",
        "excerpt",
        "visibility",
        "thumbnail",
        "readTime",
        "metaTitle",
        "metaDescription",
        "viewsCount",
        "likesCount",
        "publishedAt",
        "updatedAt",
        "userId", // Required for settings filter
      ],
      include: [
        {
          model: Topic,
          as: "topics",
          attributes: ["name"],
          through: { attributes: [] },
        },
        {
          model: Tag,
          as: "tags",
          attributes: ["name"],
          through: { attributes: [] },
        },
        {
          model: User,
          as: "author",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "avatar",
            "website",
            "socials",
            "name",
          ],
        },
      ],
    });

    return posts;
  }

  async getOwnPosts() {
    // Skip settings filter for own posts (user should see their own stats)
    const { rows: posts, count } = await Post.unscoped().findAndCountAll({
      where: { userId: this.userId },
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "title",
        "status",
        "slug",
        "content",
        "excerpt",
        "readTime",
        "thumbnail",
        "viewsCount",
        "likesCount",
        "createdAt",
        "publishedAt",
      ],
      include: [
        {
          model: User,
          as: "author",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "avatar",
            "website",
            "socials",
            "name",
          ],
        },
        {
          model: Topic,
          as: "topics",
          attributes: ["name", "id"],
          through: { attributes: [] },
        },
      ],
      skipSettingsFilter: true, // Owner should see all their stats
    });

    return {
      posts,
    };
  }

  async create(data) {
    const userId = this.userId;

    if (!data.visibility) {
      // Import setting service locally để tránh circular dependency
      const settingService = require("./setting.service");
      data.visibility = await settingService.getPostVisibilityFilter(userId);
    }
    const post = await Post.create({ ...data, userId: this.userId });
    return { message: "Create successfully", slug: post.slug };
  }

  async editPost(idOrSlug, data) {
    if ("readTime" in data) {
      const parsed = parseInt(data.readTime);
      if (isNaN(parsed)) throw new Error("readTime must be a valid number");
      data.readTime = parsed;
    }

    await Post.update(data, {
      where: {
        slug: idOrSlug,
      },
    });
    return { message: "Edit successfully" };
  }

  async likePost(postId) {
    try {
      const userId = this.userId;
      await sequelize.transaction(async (t) => {
        const user = await User.findOne({
          where: { id: userId },
          attributes: ["id", "firstName", "lastName", "avatar", "name"],
          transaction: t,
        });

        const post = await Post.findOne({
          where: { id: postId },
          attributes: ["userId"],
          transaction: t,
        });
        const existing = await Like.findOne({
          where: { userId, likableId: postId, likableType: "Post" },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (existing) {
          throw new Error("You have already liked this post");
        }

        const like = await Like.create(
          { userId, likableId: postId, likableType: "Post" },
          { transaction: t }
        );

        await Post.increment("likesCount", {
          by: 1,
          where: { id: postId },
          transaction: t,
        });
        if (userId !== post.userId) {
          const res = await notificationService.createNotification({
            data: {
              type: "like",
              notifiableType: like.likableType,
              notifiableId: postId,
              content: `${user.name} liked your post`,
            },
            userId: post.userId,
            transaction: t,
          });
          return res;
        }
      });

      return { message: "Post liked" };
    } catch (error) {
      if (
        error.name === "SequelizeUniqueConstraintError" ||
        error.message === "You have already liked this post"
      ) {
        return { message: error.message };
      }
      throw error;
    }
  }

  async unlikePost(postId) {
    try {
      const userId = this.userId;

      await sequelize.transaction(async (t) => {
        const like = await Like.findOne({
          where: { userId, likableId: postId, likableType: "Post" },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!like) {
          throw new Error("You have not liked this post yet");
        }

        await like.destroy({ transaction: t });

        await Post.decrement("likesCount", {
          by: 1,
          where: { id: postId },
          transaction: t,
        });
      });

      return { message: "Post unliked" };
    } catch (error) {
      if (error.message === "You have not liked this post yet") {
        return { message: error.message };
      }
      throw error;
    }
  }

  async bookmarkPost(postId) {
    const existingBookmark = await Bookmark.findOne({
      where: { postId, userId: this.userId },
    });

    if (existingBookmark) {
      return { message: "Post already bookmarked" };
    }

    await Bookmark.create({ postId, userId: this.userId });
    return { message: "Post bookmarked" };
  }

  async unBookmarkPost(postId) {
    const bookmark = await Bookmark.findOne({
      where: { postId, userId: this.userId },
    });

    if (!bookmark) {
      return { message: "Post not bookmarked" };
    }

    await bookmark.destroy();
    return { message: "Post unbookmarked" };
  }

  async clearBookmarks() {
    await Bookmark.destroy({
      where: { userId: this.userId },
    });
    return { message: "All bookmarks cleared" };
  }

  async publishPost(data) {
    const { isScheduled, postId, publishDate, topics, ...body } = data;
    if (postId) {
      await this.update(postId, body);
      await handlePostTopic({ postId, topicNames: JSON.parse(topics) });
      return { postId };
    }
    if (JSON.parse(isScheduled)) {
      body.publishedAt = publishDate;
    } else {
      body.publishedAt = new Date().toISOString();
    }

    const res = await this.create({ ...body });

    await handlePostTopic({
      postId: res.postId,
      topicNames: JSON.parse(topics),
    });
    return res;
  }

  async remove(idOrSlug) {
    const post = await Post.findOne({
      where: { [Op.or]: [{ id: idOrSlug }, { slug: idOrSlug }] },
    });
    const result = await post.destroy();
    return result;
  }

  async searchPosts(search) {
    if (!search) return [];
    const posts = await Post.scope("onlyPublished").findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { excerpt: { [Op.like]: `%${search}%` } },
        ],
      },
      attributes: [
        "id",
        "title",
        "slug",
        "excerpt",
        "thumbnail",
        "publishedAt",
      ],
      limit: 10,
    });
    return posts;
  }
}

module.exports = new PostsService();
