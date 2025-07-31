const pusher = require("@/configs/pusher");
const {
  Message,
  User,
  Conversation,
  Conversation_Participant,
  sequelize,
} = require("@/models");
const getCurrentUser = require("@/utils/getCurrentUser");
const { Op } = require("sequelize");

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
    const message = await sequelize.transaction(async (t) => {
      const result = await Message.create(
        {
          userId,
          conversationId,
          content,
        },
        { transaction: t }
      );

      const fullMessage = await Message.findOne({
        where: { id: result.id },
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "avatar"],
          },
        ],
        transaction: t,
      });

      await Conversation.update(
        { updatedAt: new Date() },
        { where: { id: conversationId }, transaction: t }
      );

      await Conversation_Participant.increment(
        { unreadCount: 1 },
        {
          where: {
            conversationId,
            userId: { [Op.ne]: userId },
          },
          transaction: t,
        }
      );

      return fullMessage;
    });
    await pusher.trigger(
      `conversation-${conversationId}`,
      "new-message",
      message
    );

    return message;
  }
}

module.exports = new MessageService();
