const {
  Conversation,
  User,
  Conversation_Participant,
  Message,
} = require("@/models");
const getCurrentUser = require("@/utils/getCurrentUser");

class ConversationService {
  async getAllConversations() {
    const userId = getCurrentUser();

    const participateIn = await Conversation_Participant.findAll({
      where: { userId },
      attributes: ["conversationId", "unreadCount"],
      raw: true,
    });

    const conversationIds = participateIn.map((p) => p.conversationId);

    const conversations = await Conversation.findAll({
      where: {
        id: conversationIds,
      },
      attributes: [
        "id",
        "name",
        "creatorId",
        "avatar",
        "groupAvatar",
        "groupName",
        "isOnline",
        "isGroup",
      ],
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
            "name",
            "status",
          ],
          through: { attributes: [] },
        },
        {
          model: Message,
          as: "messages",
          limit: 1,
          order: [["createdAt", "DESC"]],
          attributes: ["id", "type", "content", "status", "createdAt"],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    const unreadMap = Object.fromEntries(
      participateIn.map((p) => {
        return [p.conversationId, p.unreadCount];
      })
    );

    conversations.forEach((conv) => {
      const lastMessage = conv.getDataValue("messages")?.[0] || null;
      conv.setDataValue("lastMessage", lastMessage);
      conv.setDataValue("unreadCount", unreadMap[conv.id] || 0);
    });
    return conversations;
  }

  async markRead(conversationId) {
    const userId = getCurrentUser();

    await Conversation_Participant.update(
      { unreadCount: 0 },
      {
        where: {
          conversationId,
          userId,
        },
      }
    );
    return;
  }

  async getSharedConversation(otherId) {
    const userId = getCurrentUser();

    // Tìm tất cả conversation mà cả 2 user đều tham gia
    const userConversations = await Conversation_Participant.findAll({
      where: { userId },
      attributes: ["conversationId"],
      raw: true,
    });

    const otherConversations = await Conversation_Participant.findAll({
      where: { userId: otherId },
      attributes: ["conversationId"],
      raw: true,
    });

    // Tìm conversation chung
    const userConvIds = userConversations.map((c) => c.conversationId);
    const otherConvIds = otherConversations.map((c) => c.conversationId);
    const sharedConvIds = userConvIds.filter((id) => otherConvIds.includes(id));

    if (sharedConvIds.length === 0) {
      return { message: "No shared conversation yet" };
    }

    // Kiểm tra từng conversation để tìm conversation chỉ có đúng 2 người
    for (const convId of sharedConvIds) {
      const participantCount = await Conversation_Participant.count({
        where: { conversationId: convId },
      });

      if (participantCount === 2) {
        // Đây là conversation private giữa 2 người
        const sharedConversation = await Conversation.findOne({
          where: { id: convId },
          attributes: ["id", "name", "creatorId", "avatar", "isOnline"],
          include: [
            {
              model: Message,
              as: "messages",
              order: [["createdAt", "DESC"]],
              include: [
                {
                  model: User,
                  as: "author",
                  attributes: ["id", "avatar"],
                },
              ],
            },
          ],
        });

        return sharedConversation;
      }
    }

    return null;
  }
}

module.exports = new ConversationService();
