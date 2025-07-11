const { Post, User, Comment } = require("@/models");
const { Op } = require("sequelize");
class PostsService {
  async getAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const { count, rows } = await Post.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: {
        model: User,
        as: "author",
        attributes: ["id", "name", "email", "username"],
      },
    });
    return {
      data: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        pageSize: limit,
      },
    };
  }

  async getById(idOrSlug) {
    const post = await Post.findOne({
      where: {
        [Op.or]: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email", "username"],
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              as: "commenter",
              attributes: ["id", "name", "email", "username"],
            },
          ],
          as: "comments",
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
