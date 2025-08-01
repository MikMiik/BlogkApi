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
    const userId = getCurrentUser();

    // Kiểm tra trạng thái participant của user hiện tại
    const participant = await Conversation_Participant.findOne({
      where: { conversationId, userId },
      paranoid: false, // Tìm cả những record đã bị soft delete
    });

    if (!participant) {
      throw new Error("You are not a participant of this conversation");
    }

    // Tạo điều kiện where cho messages
    let messageWhere = { conversationId };

    // Nếu user đã xóa conversation và có historyCutoff
    if (participant.historyCutoff) {
      // Chỉ lấy tin nhắn trước thời điểm xóa (historyCutoff)
      messageWhere.createdAt = {
        [Op.gt]: participant.historyCutoff,
      };
    }

    const messages = await Message.findAll({
      where: messageWhere,
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "avatar"],
        },
      ],
      order: [["createdAt", "ASC"]], // Sắp xếp theo thời gian tạo
    });

    return messages;
  }
  async create({ conversationId, content }) {
    const userId = getCurrentUser();
    const message = await sequelize.transaction(async (t) => {
      await Conversation_Participant.update(
        {
          isDeleted: false,
          deletedAt: null,
        },
        {
          where: {
            conversationId,
            isDeleted: true,
          },
          paranoid: false,
          transaction: t,
        }
      );

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
