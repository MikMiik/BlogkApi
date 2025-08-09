const { ChatbotConversation } = require("@/models");
const getCurrentUser = require("@/utils/getCurrentUser");

class ConversationService {
  constructor() {
    this.defaultOptions = {
      maxConversationsPerUser: 50,
      autoDeactivateAfterDays: 30,
      maxTitleLength: 500,
    };
  }

  /**
   * Get or create a conversation for the user
   * @param {number|null} userId - User ID (null for anonymous)
   * @param {string|null} sessionId - Existing session ID
   * @returns {Promise<Object>} Conversation object
   */
  async getOrCreateConversation(userId = null, sessionId = null) {
    try {
      // If user is logged in, try to get their active conversation
      if (userId && !sessionId) {
        const activeConversation =
          await ChatbotConversation.getActiveUserConversation(userId);
        if (activeConversation) {
          return {
            sessionId: activeConversation.sessionId,
            conversationId: activeConversation.id,
            title: activeConversation.title,
            messageCount: activeConversation.messageCount,
            isNew: false,
          };
        }
      }

      // Try to find existing conversation by sessionId
      if (sessionId) {
        const existing = await ChatbotConversation.findBySessionId(sessionId);
        if (existing) {
          // Verify ownership if user is logged in
          if (userId && existing.userId !== userId) {
            // Session belongs to different user, create new one
            return await this.createNewConversation(userId);
          }

          // Update user association if conversation was anonymous
          if (userId && !existing.userId) {
            await existing.update({ userId });
          }

          return {
            sessionId: existing.sessionId,
            conversationId: existing.id,
            title: existing.title,
            messageCount: existing.messageCount,
            isNew: false,
          };
        }
      }

      // Create new conversation
      return await this.createNewConversation(userId, sessionId);
    } catch (error) {
      console.error("Error in getOrCreateConversation:", error);
      throw new Error("Failed to get or create conversation");
    }
  }

  /**
   * Create a new conversation
   * @param {number|null} userId - User ID
   * @param {string|null} sessionId - Optional session ID
   * @returns {Promise<Object>} New conversation object
   */
  async createNewConversation(userId = null, sessionId = null) {
    try {
      // Generate unique session ID if not provided
      const newSessionId = sessionId || this.generateSessionId();

      // Clean up old conversations if user has too many
      if (userId) {
        await this.cleanupOldConversations(userId);
      }

      const conversation = await ChatbotConversation.createConversation(
        newSessionId,
        userId,
        "New Conversation"
      );

      return {
        sessionId: conversation.sessionId,
        conversationId: conversation.id,
        title: conversation.title,
        messageCount: 0,
        isNew: true,
      };
    } catch (error) {
      console.error("Error creating new conversation:", error);
      throw new Error("Failed to create new conversation");
    }
  }

  /**
   * Get user's conversations list
   * @param {number} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} List of conversations
   */
  async getUserConversations(userId, options = {}) {
    try {
      const conversations = await ChatbotConversation.findUserConversations(
        userId,
        options
      );

      return conversations.map((conv) => ({
        id: conv.id,
        sessionId: conv.sessionId,
        title: conv.title,
        messageCount: conv.messageCount,
        lastMessageAt: conv.lastMessageAt,
        isActive: conv.isActive,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        lastMessage: conv.messages?.[0] || null,
      }));
    } catch (error) {
      console.error("Error getting user conversations:", error);
      throw new Error("Failed to get user conversations");
    }
  }

  /**
   * Update conversation activity
   * @param {string} sessionId - Session ID
   * @returns {Promise<void>}
   */
  async updateConversationActivity(sessionId) {
    try {
      const conversation = await ChatbotConversation.findBySessionId(sessionId);
      if (conversation) {
        await conversation.updateActivity();
      }
    } catch (error) {
      console.error("Error updating conversation activity:", error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Increment message count
   * @param {string} sessionId - Session ID
   * @returns {Promise<void>}
   */
  async incrementMessageCount(sessionId) {
    try {
      const conversation = await ChatbotConversation.findBySessionId(sessionId);
      if (conversation) {
        await conversation.incrementMessageCount();
      }
    } catch (error) {
      console.error("Error incrementing message count:", error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Update conversation title
   * @param {string} sessionId - Session ID
   * @param {string} title - New title
   * @returns {Promise<void>}
   */
  async updateConversationTitle(sessionId, title) {
    try {
      const conversation = await ChatbotConversation.findBySessionId(sessionId);
      if (conversation) {
        await conversation.updateTitle(title);
      }
    } catch (error) {
      console.error("Error updating conversation title:", error);
      throw new Error("Failed to update conversation title");
    }
  }

  /**
   * Deactivate conversation
   * @param {string} sessionId - Session ID
   * @returns {Promise<void>}
   */
  async deactivateConversation(sessionId) {
    try {
      const conversation = await ChatbotConversation.findBySessionId(sessionId);
      if (conversation) {
        await conversation.deactivate();
      }
    } catch (error) {
      console.error("Error deactivating conversation:", error);
      throw new Error("Failed to deactivate conversation");
    }
  }

  /**
   * Deactivate all user conversations (on logout)
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  async deactivateUserConversations(userId) {
    try {
      await ChatbotConversation.deactivateUserConversations(userId);
    } catch (error) {
      console.error("Error deactivating user conversations:", error);
      throw new Error("Failed to deactivate user conversations");
    }
  }

  /**
   * Clean up old conversations
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  async cleanupOldConversations(userId) {
    try {
      const conversations = await ChatbotConversation.findUserConversations(
        userId,
        {
          limit: 1000,
          includeInactive: true,
        }
      );

      // Keep only the most recent conversations
      if (conversations.length > this.defaultOptions.maxConversationsPerUser) {
        const toDeactivate = conversations.slice(
          this.defaultOptions.maxConversationsPerUser
        );
        for (const conv of toDeactivate) {
          await conv.deactivate();
        }
      }

      // Deactivate very old conversations
      const cutoffDate = new Date();
      cutoffDate.setDate(
        cutoffDate.getDate() - this.defaultOptions.autoDeactivateAfterDays
      );

      await ChatbotConversation.update(
        { isActive: false },
        {
          where: {
            userId,
            updatedAt: { [require("sequelize").Op.lt]: cutoffDate },
            isActive: true,
          },
        }
      );
    } catch (error) {
      console.error("Error cleaning up old conversations:", error);
      // Don't throw - this is maintenance
    }
  }

  /**
   * Generate unique session ID
   * @returns {string} Unique session ID
   */
  generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `session_${timestamp}_${random}`;
  }

  /**
   * Auto-generate conversation title from first message
   * @param {string} firstMessage - First user message
   * @returns {string} Generated title
   */
  generateConversationTitle(firstMessage) {
    if (!firstMessage || typeof firstMessage !== "string") {
      return "New Conversation";
    }

    // Clean and truncate the message
    let title = firstMessage.trim().replace(/\n/g, " ").replace(/\s+/g, " ");

    // Limit length
    if (title.length > 50) {
      title = title.substring(0, 47) + "...";
    }

    return title || "New Conversation";
  }
}

module.exports = new ConversationService();
