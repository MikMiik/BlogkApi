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
const { Op, where } = require("sequelize");
class PostsService {
  async getAll(page = 1, limit = 10, userId) {
    const offset = (page - 1) * limit;

    const { rows: posts, count } = await Post.findAndCountAll({
      userId,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      attributes: [
        "id",
        "title",
        "description",
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

    const featuredPosts = await Post.findAll({
      order: [["viewsCount", "DESC"]],
      limit: 10,
      userId,
      attributes: [
        "id",
        "title",
        "description",
        "slug",
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

    const latestPosts = await Post.findAll({
      order: [["publishedAt", "DESC"]],
      limit: 10,
      userId,
      attributes: [
        "id",
        "title",
        "description",
        "slug",
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

  async getById(idOrSlug, userId) {
    const post = await Post.findOne({
      userId,
      where: {
        [Op.or]: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      attributes: [
        "id",
        "title",
        "description",
        "content",
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
        userId,
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
      relatedPosts = await Post.findAll({
        userId,
        attributes: [
          "id",
          "title",
          "description",
          "slug",
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

  async create(data) {
    const post = await Post.create(data);
    return post;
  }

  async update(idOrSlug, data) {
    const post = await Post.update(data, {
      where: {
        [Op.or]: [{ id: idOrSlug }],
      },
    });
    return { postId: idOrSlug };
  }

  async likePost({ postId, userId }) {
    await Like.create({ userId, likableId: postId, likableType: "Post" });
    return { message: "Post liked" };
  }

  async unlikePost({ postId, userId }) {
    const like = await Like.findOne({
      where: { userId, likableId: postId, likableType: "Post" },
    });
    if (!like) return { message: "Like not found" };

    await like.destroy();
    return { message: "Post unliked" };
  }

  async bookmarkPost({ postId, userId }) {
    await Bookmark.create({ postId, userId });
    return { message: "Post bookmarked" };
  }

  async unBookmarkPost({ postId, userId }) {
    const bookmark = await Bookmark.findOne({
      where: { postId, userId },
    });
    if (!bookmark) return { message: "Bookmark not found" };

    await bookmark.destroy();
    return { message: "Post unBookmarked" };
  }

  async remove(id) {
    const result = await Post.destroy({ where: { id } });
    return result;
  }
}

module.exports = new PostsService();
