const pusher = require("@/configs/pusher");
const { Message, User, Conversation } = require("@/models");
const getCurrentUser = require("@/utils/getCurrentUser");

class MessageService {
  async getConversationMessages(conversationId) {
    const messages = await Message.findAll({
      where: { conversationId },
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
  async create({ conversationId, content }) {
    const userId = getCurrentUser();
    const result = await Message.create({ userId, conversationId, content });
    const message = await Message.findOne({
      where: { id: result.id },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "avatar"],
        },
      ],
    });
    await Conversation.update(
      { updatedAt: new Date() },
      { where: { id: conversationId } }
    );
    pusher.trigger(`conversation-${conversationId}`, "new-message", message);

    return message;
  }
}

module.exports = new MessageService();
