const { Conversation, Message, User } = require("@/models");

class MessageService {
  async getConversationMessages({ conversationId }) {
    const conversation = await Conversation.findOne({
      where: { id: conversationId },
      attributes: ["id", "name", "creatorId", "avatar", "lastMessage"],
      include: [
        {
          model: User,
          as: "participants",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "username",
            "avatar",
            "status",
          ],
          through: { attributes: [] },
        },

        {
          model: Message,
          as: "messages",
          attributes: [
            "senderId",
            "type",
            "content",
            "status",
            "createdAt",
            "updatedAt",
          ],
          order: [["createdAt", "DESC"]],
        },
      ],
    });
    return conversation;
  }
}

module.exports = new MessageService();
