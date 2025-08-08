const { ChatHistory } = require("@/models");
const { Op } = require("sequelize");

class ChatHistoryService {
  // Lưu tin nhắn mới
  async saveMessage(
    sessionId,
    userId,
    messageContent,
    messageType,
    agentName,
    metadata = {}
  ) {
    try {
      return await ChatHistory.create({
        sessionId,
        userId: userId || null,
        messageContent,
        messageType,
        agentName,
        confidence: metadata.confidence || null,
        classificationMethod: metadata.classificationMethod || null,
        estimatedCost: metadata.estimatedCost || 0,
        metadata,
      });
    } catch (error) {
      console.error("Error saving message:", error);
      throw error;
    }
  }

  // Lấy tin nhắn gần đây nhất của session (để làm context)
  async getRecentHistory(sessionId, limit = 5) {
    try {
      const messages = await ChatHistory.findAll({
        where: { sessionId },
        order: [["createdAt", "DESC"]],
        limit,
        raw: false,
      });

      // Trả về theo thứ tự cũ đến mới (để làm context)
      return messages.reverse();
    } catch (error) {
      console.error("Error getting recent history:", error);
      return [];
    }
  }

  // Lấy lịch sử chat của session (theo thứ tự thời gian)
  async getSessionHistory(sessionId, limit = 20) {
    try {
      return await ChatHistory.findAll({
        where: { sessionId },
        order: [["createdAt", "ASC"]],
        limit,
        raw: false,
      });
    } catch (error) {
      console.error("Error getting session history:", error);
      return [];
    }
  }

  // Lấy thống kê của session
  async getSessionStats(sessionId) {
    try {
      const stats = await ChatHistory.findAll({
        where: { sessionId },
        attributes: [
          [
            ChatHistory.sequelize.fn("COUNT", ChatHistory.sequelize.col("id")),
            "totalMessages",
          ],
          [
            ChatHistory.sequelize.fn(
              "COUNT",
              ChatHistory.sequelize.literal(
                'CASE WHEN messageType = "user" THEN 1 END'
              )
            ),
            "userMessages",
          ],
          [
            ChatHistory.sequelize.fn(
              "COUNT",
              ChatHistory.sequelize.literal(
                'CASE WHEN messageType = "assistant" THEN 1 END'
              )
            ),
            "assistantMessages",
          ],
          [
            ChatHistory.sequelize.fn(
              "SUM",
              ChatHistory.sequelize.col("estimatedCost")
            ),
            "totalCost",
          ],
          [
            ChatHistory.sequelize.fn(
              "MIN",
              ChatHistory.sequelize.col("createdAt")
            ),
            "firstMessage",
          ],
          [
            ChatHistory.sequelize.fn(
              "MAX",
              ChatHistory.sequelize.col("createdAt")
            ),
            "lastMessage",
          ],
        ],
        raw: true,
      });

      return stats[0] || {};
    } catch (error) {
      console.error("Error getting session stats:", error);
      return {};
    }
  }

  // Lấy danh sách session của user
  async getUserSessions(userId, limit = 20) {
    try {
      return await ChatHistory.findAll({
        where: { userId },
        attributes: ["sessionId", "createdAt"],
        group: ["sessionId"],
        order: [["createdAt", "DESC"]],
        limit,
        raw: true,
      });
    } catch (error) {
      console.error("Error getting user sessions:", error);
      return [];
    }
  }

  // Xóa lịch sử chat của session
  async clearSession(sessionId) {
    try {
      const result = await ChatHistory.destroy({
        where: { sessionId },
      });
      return { success: true, deletedCount: result };
    } catch (error) {
      console.error("Error clearing session:", error);
      throw error;
    }
  }

  // Lấy thống kê tổng quan
  async getOverallStats() {
    try {
      const totalMessages = await ChatHistory.count();
      const totalSessions = await ChatHistory.count({
        distinct: true,
        col: "sessionId",
      });
      const totalUsers = await ChatHistory.count({
        distinct: true,
        col: "userId",
        where: {
          userId: { [Op.not]: null },
        },
      });

      const costStats = await ChatHistory.findAll({
        attributes: [
          [
            ChatHistory.sequelize.fn(
              "SUM",
              ChatHistory.sequelize.col("estimatedCost")
            ),
            "totalCost",
          ],
          [
            ChatHistory.sequelize.fn(
              "AVG",
              ChatHistory.sequelize.col("estimatedCost")
            ),
            "avgCost",
          ],
        ],
        raw: true,
      });

      return {
        totalSessions,
        totalMessages,
        totalUsers,
        anonymousSessions: totalSessions - totalUsers,
        costs: costStats[0] || { totalCost: 0, avgCost: 0 },
      };
    } catch (error) {
      console.error("Error getting overall stats:", error);
      return {};
    }
  }

  // API methods for external use
  async getConversationHistory(sessionId, limit = 20) {
    try {
      const historyRecords = await this.getSessionHistory(sessionId, limit);
      // Convert to OpenAI format for API response
      return historyRecords.map((record) => record.messageContent);
    } catch (error) {
      console.error("Error getting conversation history:", error);
      return [];
    }
  }

  async clearConversationHistory(sessionId) {
    try {
      if (!sessionId) {
        throw new Error("Session ID is required");
      }
      return await this.clearSession(sessionId);
    } catch (error) {
      console.error("Error clearing conversation history:", error);
      throw new Error("Failed to clear conversation history");
    }
  }
}

module.exports = new ChatHistoryService();
