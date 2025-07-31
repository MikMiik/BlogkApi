const { Comment, User, Like } = require("@/models");
const getCurrentUser = require("@/utils/getCurrentUser");
const { Op } = require("sequelize");
class CommentsService {
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
      const userId = getCurrentUser();

      await sequelize.transaction(async (t) => {
        const existing = await Like.findOne({
          where: { userId, likableId: commentId, likableType: "Comment" },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (existing) {
          throw new Error("You have already liked this comment");
        }

        await Like.create(
          { userId, likableId: commentId, likableType: "Comment" },
          { transaction: t }
        );

        await Comment.increment("likesCount", {
          by: 1,
          where: { id: commentId },
          transaction: t,
        });
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
      const userId = getCurrentUser();

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
