const {
  Conversation,
  User,
  Conversation_Participant,
  Message,
} = require("@/models");
const getCurrentUser = require("@/utils/getCurrentUser");
const messageService = require("./message.service");

class ConversationService {
  async getAllConversations() {
    const userId = getCurrentUser();

    const participateIn = await Conversation_Participant.findAll({
      where: {
        userId,
        isDeleted: false, // Chỉ lấy những conversation mà user chưa xóa
      },
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
      paranoid: false,
      raw: true,
    });

    const otherConversations = await Conversation_Participant.findAll({
      where: { userId: otherId },
      attributes: ["conversationId"],
      paranoid: false,
      raw: true,
    });

    // Tìm conversation chung
    const userConvIds = userConversations.map((c) => c.conversationId);
    const otherConvIds = otherConversations.map((c) => c.conversationId);
    const sharedConvIds = userConvIds.filter((id) => otherConvIds.includes(id));

    if (sharedConvIds.length === 0) {
      return null;
    }

    // Kiểm tra từng conversation để tìm conversation chỉ có đúng 2 người
    for (const convId of sharedConvIds) {
      const participantCount = await Conversation_Participant.count({
        where: { conversationId: convId },
        paranoid: false, // Đếm cả những participant đã bị soft delete
      });

      if (participantCount === 2) {
        // Đây là conversation private giữa 2 người
        const sharedConversation = await Conversation.findOne({
          where: { id: convId },
          attributes: ["id", "name", "creatorId", "isOnline"],
        });

        // Sử dụng messageService để lấy messages với logic historyCutoff
        const messages = await messageService.getConversationMessages(convId);
        sharedConversation.setDataValue("messages", messages);

        return sharedConversation;
      }
    }

    return null;
  }

  async createConversation({ name, otherId }) {
    const userId = getCurrentUser();

    // Kiểm tra xem đã có conversation giữa 2 người chưa
    const existingConversation = await this.getSharedConversation(otherId);
    if (existingConversation) {
      // Nếu đã có conversation, trả về conversation hiện tại
      return existingConversation;
    }

    // Tạo conversation mới
    const conversation = await Conversation.create({
      name,
      creatorId: userId,
    });

    // Thêm người tạo vào participant
    await Conversation_Participant.create({
      conversationId: conversation.id,
      userId,
    });

    // Thêm người còn lại vào participant
    await Conversation_Participant.create({
      conversationId: conversation.id,
      userId: otherId,
    });

    return conversation;
  }

  async deleteConversation(conversationId) {
    const userId = getCurrentUser();

    // Kiểm tra quyền xóa
    const participant = await Conversation_Participant.findOne({
      where: { conversationId, userId },
    });

    if (!participant) {
      throw new Error("You are not a participant of this conversation");
    }

    const now = new Date();
    await Conversation_Participant.update(
      {
        isDeleted: true,
        historyCutoff: now,
        deletedAt: now,
      },
      {
        where: {
          conversationId,
          userId,
        },
      }
    );

    return true;
  }

  async restoreConversation(conversationId) {
    const userId = getCurrentUser();

    // Kiểm tra xem user có từng là participant không
    const deletedParticipant = await Conversation_Participant.findOne({
      where: { conversationId, userId },
      paranoid: false,
    });

    if (!deletedParticipant) {
      throw new Error("You were never a participant of this conversation");
    }

    // Khôi phục participant của user bằng cách reset các field deletion
    // Đây là MANUAL RESTORE nên user có thể thấy lại toàn bộ lịch sử
    await Conversation_Participant.update(
      {
        isDeleted: false,
        historyCutoff: null, // Reset để thấy lại toàn bộ tin nhắn
        deletedAt: null,
      },
      {
        where: {
          conversationId,
          userId,
        },
        paranoid: false,
      }
    );

    return true;
  }
}

module.exports = new ConversationService();
