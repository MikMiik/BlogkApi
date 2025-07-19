const { Post, User, Comment, Topic, Image, Tag } = require("@/models");
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
          attributes: ["id", "firstName", "lastName", "avatar", "socials"],
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
            "socials",
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
          attributes: [
            "id",
            "parentId",
            "content",
            "likesCount",
            "createdAt",
            "updatedAt",
          ],
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: User,
              as: "commenter",
              attributes: ["id", "firstName", "username", "lastName", "avatar"],
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

    let relatedPosts = [];
    if (post && post.topics && post.topics.length > 0) {
      const topicNames = post.topics.map((topic) => topic.name);
      relatedPosts = await Post.findAll({
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
            attributes: ["id", "firstName", "lastName", "avatar"],
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
    return { post, relatedPosts };
  }

  async getCommentsByPostId(idOrSlug, limitComments) {
    // const page = parseInt(commentsPage) || 1;
    // const limit = parseInt(commentsLimit) || 10;
    // const offset = (page - 1) * limit;
    const post = await Post.findOne({
      where: {
        [Op.or]: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      attributes: ["id"],
    });
    const { rows, count } = await Comment.findAndCountAll({
      limit: limitComments,
      // offset,
      // subQuery: false,
      where: {
        [Op.and]: [{ commentableType: "Post" }, { commentableId: post.id }],
      },
      attributes: [
        "id",
        "parentId",
        "content",
        "likesCount",
        "createdAt",
        "updatedAt",
      ],
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "commenter",
          attributes: ["id", "firstName", "username", "lastName", "avatar"],
          subQuery: false,
        },
      ],
    });

    return { rows, count };
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
