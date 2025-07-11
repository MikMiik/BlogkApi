const { Post, Topic } = require("@/models");
const { Op } = require("sequelize");
const { fn, col, literal } = require("sequelize");
class TopicsService {
  async getAll() {
    const topics = await Topic.findAll({
      attributes: ["id", "name", "description", "slug", "image", "isActive"],
    });

    const trendingTopics = await Topic.findAll({
      subQuery: false, // ⭐ thêm dòng này
      attributes: [
        "id",
        "name",
        "slug",
        "description",
        "image",
        "isActive",
        [fn("COUNT", col("posts.id")), "postCount"],
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
      order: [[literal("postCount"), "DESC"]],
      limit: 3,
    });

    return { topics, trendingTopics };
  }

  async getById(idOrSlug) {
    const topic = await Topic.findOne({
      where: {
        [Op.or]: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });
    return topic;
  }
}

module.exports = new TopicsService();
