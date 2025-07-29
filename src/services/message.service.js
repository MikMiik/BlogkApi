const {
  Conversation,
  Message,
  User,
  Conversation_Participant,
} = require("@/models");
const getCurrentUser = require("@/utils/getCurrentUser");

class MessageService {
  async getConversationMessages(conversationId) {
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
  async create(data) {
    const userId = getCurrentUser();
    const result = await Message.create({ senderId: userId, ...data });
    const message = await Message.findOne({
      where: {
        id: result.id,
      },
      attributes: ["id", "type", "content", "status", "createdAt", "updatedAt"],
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "avatar"],
        },
      ],
    });
    return message;
  }
}

module.exports = new MessageService();
