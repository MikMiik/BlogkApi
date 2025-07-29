const { Conversation, User, Conversation_Participant } = require("@/models");
const getCurrentUser = require("@/utils/getCurrentUser");

class MessageService {
  async getAllConversations() {
    const userId = getCurrentUser();
    console.log(userId);

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
        "lastMessage",
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
      ],
      order: [["createdAt", "DESC"]],
    });

    return conversations;
  }
}

module.exports = new MessageService();
