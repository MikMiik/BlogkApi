const { User, Achievement, Post, Topic, Privacy } = require("@/models");
const { Op } = require("sequelize");
const userService = require("./user.service");

class ProfileService {
  async getById({ id, page = 1, limit = 10, userId }) {
    const offset = (page - 1) * limit;

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
        "skills",
        "address",
        "website",
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
          model: Achievement,
          as: "achievements",
          attributes: ["name", "icon"],
          through: { attributes: [] },
        },
      ],
    });

    const { count, rows: posts } = await Post.scope(
      "onlyPublished"
    ).findAndCountAll({
      where: { userId: user.id },
      userId,
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
      distinct: true,
    });
    return { user, posts, count };
  }

  async getToEdit({ id }) {
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
        "skills",
        "website",
        "address",
        "socials",
        "avatar",
        "introduction",
        "role",
        "coverImage",
      ],
      include: [
        {
          model: Achievement,
          as: "achievements",
          attributes: ["name", "icon"],
          through: { attributes: [] },
        },
        {
          model: Privacy,
          as: "privacy",
          attributes: [
            "profileVisibility",
            "showEmail",
            "showFollowersCount",
            "showFollowingCount",
            "allowDirectMessages",
            "showOnlineStatus",
          ],
        },
      ],
    });
    return { user };
  }

  async editProfile({ userId, data, files }) {
    try {
      if (files.avatar) {
        data.avatar = `/uploads/${files.avatar[0].filename}`;
      }
      if (files.coverImage) {
        data.coverImage = `/uploads/${files.coverImage[0].filename}`;
      }
      const { privacy, socials, skills, ...body } = data;
      body.socials = JSON.parse(socials);
      body.skills = JSON.parse(skills);
      await userService.update(userId, {
        ...body,
      });

      const res = await Privacy.update(JSON.parse(privacy), {
        where: { userId },
      });

      return { message: "Update successfully" };
    } catch (error) {
      console.log(error);

      throw new Error("Update failed");
    }
  }
}

module.exports = new ProfileService();
