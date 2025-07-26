const { Conversation, Message, User } = require("@/models");
const getCurrentUser = require("@/utils/getCurrentUser");
const { Op } = require("sequelize");

class MessageService {
  async getAllConversations() {
    const user = getCurrentUser();
    const conversations = await Conversation.findAll({
      where: {
        creatorId: user.id,
      },
      attributes: ["id", "name", "creatorId", "avatar", "isOnline"],
      include: [
        {
          model: User,
          as: "participants",
          where: {
            id: { [Op.ne]: user.id },
          },
          attributes: [
            "id",
            "firstName",
            "lastName",
            "username",
            "avatar",
            "name",
            "status",
          ],
          through: { attributes: [] },
        },
        {
          model: Message,
          as: "lastMessage",
          separate: true,
          limit: 1,
          order: [["createdAt", "DESC"]],
          attributes: [
            "id",
            "senderId",
            "type",
            "content",
            "status",
            "createdAt",
            "updatedAt",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return conversations;
  }
  async getConversationMessages({ conversationId }) {
    const messages = await Message.findAll({
      where: { conversationId },
      attributes: ["id", "type", "content", "status", "createdAt", "updatedAt"],
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "avatar"],
        },
      ],
    });
    return messages;
  }
}

module.exports = new MessageService();
