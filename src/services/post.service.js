const { Post, User, Comment, Topic, Image } = require("@/models");
const { Op } = require("sequelize");
class PostsService {
  async getAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { rows, count } = await Post.findAndCountAll({
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
          attributes: ["id", "firstName", "lastName", "avatar"],
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
          attributes: ["id", "firstName", "lastName", "avatar"],
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
          attributes: ["id", "firstName", "lastName", "avatar"],
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
      rows,
      count,
      featuredPosts,
      latestPosts,
    };
  }

  async getById(idOrSlug) {
    const post = await Post.findOne({
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
          model: User,
          as: "author",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "avatar",
            "username",
            "introduction",
            "postsCount",
            "followersCount",
            "followingCount",
          ],
        },
        {
          model: Comment,
          as: "comments",
          attributes: ["id", "parentId", "content", "createdAt", "updatedAt"],
          include: [
            {
              model: User,
              as: "commenter",
              attributes: ["id", "firstName", "lastName", "avatar"],
            },
          ],
        },
        {
          model: Image,
          as: "images",
          attributes: ["url", "altText"],
        },
      ],
    });
    return post;
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

  async remove(id) {
    const result = await Post.destroy({ where: { id } });
    return result;
  }
}

module.exports = new PostsService();
