const { Comment, User, Like } = require("@/models");
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

  async likeComment({ commentId, userId }) {
    await Like.create({ userId, likableId: commentId, likableType: "Comment" });
    return { message: "Comment liked" };
  }

  async unlikeComment({ commentId, userId }) {
    const like = await Like.findOne({
      where: { userId, likableId: commentId, likableType: "Comment" },
    });
    if (!like) return { message: "Like not found" };

    await like.destroy();
    return { message: "Comment unliked" };
  }

  async remove(id) {
    const result = await Comment.destroy({ where: { id } });
    return result;
  }
}

module.exports = new CommentsService();
