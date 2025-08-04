const { Comment, User, Like, sequelize } = require("@/models");
const getCurrentUser = require("@/utils/getCurrentUser");
const { Op } = require("sequelize");
const notificationService = require("./notification.service");
class CommentsService {
  // Getter for current user ID
  get userId() {
    return getCurrentUser();
  }

  async getAll() {
    const comments = await Comment.findAll({
      attributes: [
        "id",
        "userId",
        "content",
        "parentId",
        "likesCount",
        "deletedAt",
        "createdAt",
        "updatedAt",
      ],
    });
    return comments;
  }

  async getById(id) {
    const comment = await Comment.findOne({
      where: { id },
      attributes: [
        "id",
        "userId",
        "content",
        "parentId",
        "likesCount",
        "deletedAt",
        "createdAt",
        "updatedAt",
      ],
    });
    return comment;
  }

  async create(data) {
    const comment = await Comment.create(data, {});
    const fullComment = await Comment.findOne({
      where: {
        [Op.or]: [{ id: comment.id }],
      },
      attributes: [
        "id",
        "parentId",
        "content",
        "likesCount",
        "createdAt",
        "updatedAt",
      ],
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

    return fullComment;
  }

  async update(id, data) {
    const comment = await Comment.update(data, { where: { id } });
    return comment;
  }

  async likeComment(commentId) {
    try {
      const userId = this.userId;

      await sequelize.transaction(async (t) => {
        // Get user info for notification
        const user = await User.findOne({
          where: { id: userId },
          attributes: ["id", "firstName", "lastName", "avatar", "name"],
          transaction: t,
        });

        // Get comment info to find the comment owner
        const comment = await Comment.findOne({
          where: { id: commentId },
          attributes: ["userId"],
          transaction: t,
        });

        const existing = await Like.findOne({
          where: { userId, likableId: commentId, likableType: "Comment" },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (existing) {
          throw new Error("You have already liked this comment");
        }

        const like = await Like.create(
          { userId, likableId: commentId, likableType: "Comment" },
          { transaction: t }
        );

        await Comment.increment("likesCount", {
          by: 1,
          where: { id: commentId },
          transaction: t,
        });

        // Send notification if not liking own comment
        if (userId !== comment.userId) {
          const res = await notificationService.createNotification({
            data: {
              type: "like",
              notifiableType: like.likableType,
              notifiableId: commentId,
              content: `${user.name} liked your comment`,
            },
            userId: comment.userId,
            transaction: t,
          });
          return res;
        }
      });

      return { message: "Comment liked" };
    } catch (error) {
      if (
        error.name === "SequelizeUniqueConstraintError" ||
        error.message === "You have already liked this comment"
      ) {
        return { message: error.message };
      }
      throw error;
    }
  }

  async unlikeComment(commentId) {
    try {
      const userId = this.userId;

      await sequelize.transaction(async (t) => {
        const existing = await Like.findOne({
          where: { userId, likableId: commentId, likableType: "Comment" },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!existing) {
          throw new Error("You have not liked this comment yet");
        }

        await existing.destroy({ transaction: t });

        await Comment.decrement("likesCount", {
          by: 1,
          where: { id: commentId },
          transaction: t,
        });
      });

      return { message: "Comment unliked" };
    } catch (error) {
      if (
        error.name === "SequelizeUniqueConstraintError" ||
        error.message === "You have not liked this comment yet"
      ) {
        return { message: error.message };
      }
      throw error;
    }
  }
}

module.exports = new CommentsService();
