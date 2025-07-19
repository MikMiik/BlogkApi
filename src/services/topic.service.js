const { Post, Topic, Sequelize, User } = require("@/models");
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

  async getById(idOrSlug, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    console.log(limit);
    console.log(offset);

    // Lấy thông tin topic mà KHÔNG có postsCount để tránh conflict
    const topic = await Topic.findOne({
      where: {
        [Op.or]: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      // Bỏ attributes để tránh count conflict
    });

    if (!topic) {
      throw new Error("Topic not found");
    }

    // Lấy posts với limit/offset và đếm riêng
    const { count, rows: posts } = await Post.findAndCountAll({
      include: [
        {
          model: Topic,
          as: "topics",
          where: {
            id: topic.id, // Dùng topic.id thay vì idOrSlug
          },
          attributes: ["name"],
          through: { attributes: [] },
        },
        {
          model: User,
          as: "author",
          attributes: ["id", "firstName", "lastName", "avatar", "socials"],
        },
      ],
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
      order: [["publishedAt", "DESC"]],
      limit,
      offset,
      distinct: true, // Quan trọng: tránh duplicate count do include
    });

    return { topic, posts, count };
  }
}

module.exports = new TopicsService();
