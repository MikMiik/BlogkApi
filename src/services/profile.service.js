const {
  User,
  Achievement,
  Post,
  Topic,
  Privacy,
  Follow,
  sequelize,
} = require("@/models");
const { Op } = require("sequelize");
const userService = require("./user.service");
const getCurrentUser = require("@/utils/getCurrentUser");
const { session } = require("@/middlewares/setContext");
const notificationService = require("./notification.service");

class ProfileService {
  // Getter for current user ID
  get userId() {
    return getCurrentUser();
  }
  async getById({ id, page = 1, limit = 10 }) {
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
        "isFollowed",
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
          attributes: [
            "id",
            "firstName",
            "lastName",
            "name",
            "username",
            "avatar",
          ],
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

  async editProfile({ data, files }) {
    const userId = this.userId;

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
      throw new Error(`Update failed: ${error.message}`);
    }
  }

  async follow(username) {
    const userId = this.userId;

    try {
      // Check user exists first
      const user = await User.findOne({
        where: { username },
        attributes: ["id", "firstName", "lastName", "name"],
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (userId === user.id) {
        return { message: "Cannot follow yourself" };
      }

      // Check if already following
      const existingFollow = await Follow.findOne({
        where: { followerId: userId, followedId: user.id },
      });

      if (existingFollow) {
        return { message: "Already following this user" };
      }

      // Create follow record
      await Follow.create({ followerId: userId, followedId: user.id });

      // Create notification asynchronously (fire and forget)
      setImmediate(async () => {
        try {
          const follower = await User.findOne({
            where: { id: userId },
            attributes: ["id", "firstName", "lastName", "avatar", "name"],
          });

          if (follower) {
            await notificationService.createNotification({
              data: {
                type: "follow",
                notifiableType: "User",
                notifiableId: userId,
                content: `${follower.name} started following you`,
              },
              userId: user.id,
            });
          }
        } catch (error) {
          console.error("Error creating follow notification:", error);
        }
      });

      return { message: "Followed" };
    } catch (error) {
      if (error.message === "User not found") {
        throw error;
      }
      throw new Error(`Follow failed: ${error.message}`);
    }
  }

  async unfollow(username) {
    const userId = this.userId;

    try {
      // Check user exists first
      const user = await User.findOne({
        where: { username },
        attributes: ["id"],
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Find and delete follow record
      const follow = await Follow.findOne({
        where: { followerId: userId, followedId: user.id },
      });

      if (!follow) {
        return { message: "Not following this user" };
      }

      await follow.destroy();
      return { message: "Unfollowed" };
    } catch (error) {
      if (error.message === "User not found") {
        throw error;
      }
      throw new Error(`Unfollow failed: ${error.message}`);
    }
  }

  async searchUsers(search) {
    if (!search) return [];
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${search}%` } },
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
        ],
      },
      attributes: ["id", "username", "name", "firstName", "lastName", "avatar"],
      limit: 10,
    });
    return users;
  }
}

module.exports = new ProfileService();
