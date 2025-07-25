const {
  Post,
  User,
  Comment,
  Topic,
  Image,
  Tag,
  Like,
  Bookmark,
} = require("@/models");
const getCurrentUser = require("@/utils/getCurrentUser");
const handlePostTopic = require("@/utils/handlePostTopic");

const { Op } = require("sequelize");
class PostsService {
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
        "viewsCount",
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
          model: User,
          as: "author",
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
            "followersCount",
            "followingCount",
          ],
        },
        {
          model: Image,
          as: "images",
          attributes: ["url", "altText"],
        },
      ],
    });

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
          "viewsCount",
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

    return { post, relatedPosts, comments, commentsCount };
  }

  async getPostToEdit(idOrSlug) {
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
    });
    return post;
  }

  async getOwnPosts() {
    const { id: userId } = getCurrentUser();
    const { rows: posts, count } = await Post.unscoped().findAndCountAll({
      where: { userId },
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
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],
    });

    return {
      posts,
    };
  }

  async create(data) {
    const post = await Post.create(data);
    return { message: "Create successfully", postId: post.id };
  }

  async editPost(idOrSlug, data) {
    if ("readTime" in data) {
      const parsed = parseInt(data.readTime);
      if (isNaN(parsed)) throw new Error("readTime must be a valid number");
      data.readTime = parsed;
    }
    console.log(data);

    await Post.update(data, {
      where: {
        slug: idOrSlug,
      },
    });
    return { message: "Edit successfully" };
  }

  async likePost(postId) {
    const { id: userId } = getCurrentUser();
    await Like.create({ userId, likableId: postId, likableType: "Post" });
    return { message: "Post liked" };
  }

  async unlikePost(postId) {
    const { id: userId } = getCurrentUser();
    const like = await Like.findOne({
      where: { userId, likableId: postId, likableType: "Post" },
    });
    if (!like) return { message: "Like not found" };

    await like.destroy();
    return { message: "Post unliked" };
  }

  async bookmarkPost(postId) {
    const { id: userId } = getCurrentUser();
    await Bookmark.create({ postId, userId });
    return { message: "Post bookmarked" };
  }

  async unBookmarkPost(postId) {
    const { id: userId } = getCurrentUser();
    const bookmark = await Bookmark.findOne({
      where: { postId, userId },
    });
    if (!bookmark) return { message: "Bookmark not found" };

    await bookmark.destroy();
    return { message: "Post unBookmarked" };
  }

  async publishPost(data) {
    const { isScheduled, postId, publishDate, topics, ...body } = data;
    const { id: userId } = getCurrentUser();
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

    const res = await this.create({ ...body, userId });

    await handlePostTopic({
      postId: res.postId,
      topicNames: JSON.parse(topics),
    });
    return res;
  }

  async remove(id) {
    const result = await Post.destroy({ where: { id } });
    return result;
  }
}

module.exports = new PostsService();
