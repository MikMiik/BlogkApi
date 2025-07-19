const { User, Skill, Achievement, Post, Topic } = require("@/models");
const { Op } = require("sequelize");
class ProfileService {
  async getById(id, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    console.log(page, limit, offset);

    const user = await User.findOne({
      where: {
        [Op.or]: [{ id }, { username: id }],
      },
      attributes: [
        "id",
        "email",
        "firstName",
        "lastName",
        "username",
        "name",
        "address",
        "socials",
        "avatar",
        "introduction",
        "role",
        "coverImage",
        "status",
        "postsCount",
        "followersCount",
        "followingCount",
        "likesCount",
        "verifiedAt",
      ],
      include: [
        {
          model: Skill,
          as: "skills",
          attributes: ["name"],
          through: { attributes: [] },
        },
        {
          model: Achievement,
          as: "achievements",
          attributes: ["name", "icon"],
          through: { attributes: [] },
        },
        // {
        //   model: Post,
        //   as: "posts",
        //   attributes: [
        //     "id",
        //     "title",
        //     "description",
        //     "slug",
        //     "content",
        //     "excerpt",
        //     "readTime",
        //     "thumbnail",
        //     "viewsCount",
        //     "likesCount",
        //     "publishedAt",
        //     "viewsCount",
        //   ],
        //   include: [
        //     {
        //       model: User,
        //       as: "author",
        //       attributes: ["id", "firstName", "lastName", "name", "avatar"],
        //     },
        //     {
        //       model: Topic,
        //       as: "topics",
        //       attributes: ["name"],
        //       through: { attributes: [] },
        //     },
        //   ],
        // },
      ],
    });

    const { count, rows: posts } = await Post.findAndCountAll({
      where: { userId: user.id },
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
          attributes: ["id", "firstName", "lastName", "name", "avatar"],
        },
        {
          model: Topic,
          as: "topics",
          attributes: ["name"],
          through: { attributes: [] },
        },
      ],

      order: [["publishedAt", "DESC"]],
      limit,
      offset,
      distinct: true, // tránh duplicate count do include
    });

    return { user, posts, count };
  }
}

module.exports = new ProfileService();
