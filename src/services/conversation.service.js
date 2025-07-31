const {
  Conversation,
  User,
  Conversation_Participant,
  Message,
} = require("@/models");
const getCurrentUser = require("@/utils/getCurrentUser");

class MessageService {
  async getAllConversations() {
    const userId = getCurrentUser();

    const participateIn = await Conversation_Participant.findAll({
      where: { userId },
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
    conversations.forEach((conv) => {
      // Set lastMessage if exists
      const lastMessage = conv.getDataValue("messages")?.[0] || null;
      conv.setDataValue("lastMessage", lastMessage);
    });
    return conversations;
  }
}

module.exports = new MessageService();
