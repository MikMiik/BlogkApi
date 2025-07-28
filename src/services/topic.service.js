const { Post, Topic, User } = require("@/models");
const getCurrentUser = require("@/utils/getCurrentUser");
const { Op } = require("sequelize");
const { fn, col, literal } = require("sequelize");
class TopicsService {
  async getAll() {
    const topics = await Topic.findAll({
      attributes: [
        "id",
        "name",
        "description",
        "slug",
        "image",
        "isActive",
        [fn("COUNT", col("posts.id")), "postsCount"],
      ],
      include: [
        {
          model: Post,
          as: "posts",
          attributes: [],
          through: { attributes: [] },
        },
      ],
      group: ["Topic.id"],
      order: [[literal("postsCount"), "DESC"]],
    });

    const trendingTopics = await Topic.findAll({
      subQuery: false,
      attributes: [
        "id",
        "name",
        "slug",
        "description",
        "image",
        "isActive",
        [fn("COUNT", col("posts.id")), "postsCount"],
      ],
      include: [
        {
          model: Post,
          as: "posts",
          attributes: [],
          through: { attributes: [] },
        },
      ],
      group: ["Topic.id"],
      order: [[literal("postsCount"), "DESC"]],
      limit: 3,
    });

    return { topics, trendingTopics };
  }

  async getById({ idOrSlug, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    const userId = getCurrentUser();
    const topic = await Topic.findOne({
      where: {
        [Op.or]: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    if (!topic) {
      throw new Error("Topic not found");
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      userId,
      include: [
        {
          model: Topic,
          as: "topics",
          where: {
            id: topic.id,
          },
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
            "socials",
            "website",
            "name",
          ],
        },
      ],
      attributes: [
        "id",
        "title",
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
      order: [["publishedAt", "DESC"]],
      limit,
      offset,
      distinct: true, // tránh duplicate count do include
    });

    return { topic, posts, count };
  }
}

module.exports = new TopicsService();
