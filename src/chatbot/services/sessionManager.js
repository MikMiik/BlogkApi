const redisClient = require("@/configs/redis");

class ChatSessionManager {
  constructor() {
    this.sessionPrefix = "chat_session:";
    this.userSessionsPrefix = "user_sessions:";
    this.sessionTTL = 86400; // 24 hours
  }

  // Generate unique session ID
  generateSessionId(userId = null) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const userPart = userId ? `user_${userId}` : "anonymous";
    return `${userPart}_${timestamp}_${random}`;
  }

  // Create or get existing session
  async getOrCreateSession(userId = null, existingSessionId = null) {
    try {
      // If existing sessionId is provided and valid, use it
      if (existingSessionId) {
        const sessionExists = await redisClient.exists(
          `${this.sessionPrefix}${existingSessionId}`
        );
        if (sessionExists) {
          // Extend TTL for active session
          await redisClient.set(
            `${this.sessionPrefix}${existingSessionId}`,
            JSON.stringify({
              userId,
              createdAt: new Date().toISOString(),
              lastActivity: new Date().toISOString(),
            }),
            this.sessionTTL
          );
          return existingSessionId;
        }
      }

      // Create new session
      const sessionId = this.generateSessionId(userId);
      const sessionData = {
        userId,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        messageCount: 0,
      };

      // Store session data
      await redisClient.set(
        `${this.sessionPrefix}${sessionId}`,
        JSON.stringify(sessionData),
        this.sessionTTL
      );

      // Track user sessions if user is authenticated
      if (userId) {
        await this.addToUserSessions(userId, sessionId);
      }

      return sessionId;
    } catch (error) {
      console.error("Error managing session:", error);
      // Fallback to simple generation if Redis fails
      return this.generateSessionId(userId);
    }
  }

  // Add session to user's session list
  async addToUserSessions(userId, sessionId) {
    try {
      const userSessionsKey = `${this.userSessionsPrefix}${userId}`;

      // Get existing sessions
      const existingSessionsStr = await redisClient.get(userSessionsKey);
      const existingSessions = existingSessionsStr
        ? JSON.parse(existingSessionsStr)
        : [];

      // Add new session (keep last 10 sessions)
      existingSessions.unshift({
        sessionId,
        createdAt: new Date().toISOString(),
      });

      // Keep only last 10 sessions
      const recentSessions = existingSessions.slice(0, 10);

      // Store updated sessions
      await redisClient.set(
        userSessionsKey,
        JSON.stringify(recentSessions),
        this.sessionTTL * 7 // Keep user sessions for 7 days
      );
    } catch (error) {
      console.error("Error adding to user sessions:", error);
    }
  }

  // Update session activity
  async updateSessionActivity(sessionId, incrementMessageCount = false) {
    try {
      const sessionKey = `${this.sessionPrefix}${sessionId}`;
      const sessionDataStr = await redisClient.get(sessionKey);

      if (sessionDataStr) {
        const sessionData = JSON.parse(sessionDataStr);
        sessionData.lastActivity = new Date().toISOString();

        if (incrementMessageCount) {
          sessionData.messageCount = (sessionData.messageCount || 0) + 1;
        }

        // Update with extended TTL
        await redisClient.set(
          sessionKey,
          JSON.stringify(sessionData),
          this.sessionTTL
        );
      }
    } catch (error) {
      console.error("Error updating session activity:", error);
    }
  }

  // Get session data
  async getSessionData(sessionId) {
    try {
      const sessionKey = `${this.sessionPrefix}${sessionId}`;
      const sessionDataStr = await redisClient.get(sessionKey);

      if (sessionDataStr) {
        return JSON.parse(sessionDataStr);
      }
      return null;
    } catch (error) {
      console.error("Error getting session data:", error);
      return null;
    }
  }

  // Get user's recent sessions
  async getUserSessions(userId, limit = 10) {
    try {
      const userSessionsKey = `${this.userSessionsPrefix}${userId}`;
      const sessionsStr = await redisClient.get(userSessionsKey);

      if (sessionsStr) {
        const sessions = JSON.parse(sessionsStr);
        return sessions.slice(0, limit);
      }
      return [];
    } catch (error) {
      console.error("Error getting user sessions:", error);
      return [];
    }
  }

  // Clear session
  async clearSession(sessionId) {
    try {
      const sessionKey = `${this.sessionPrefix}${sessionId}`;
      await redisClient.del(sessionKey);
      return true;
    } catch (error) {
      console.error("Error clearing session:", error);
      return false;
    }
  }

  // Clear all user sessions
  async clearUserSessions(userId) {
    try {
      // Get user sessions first
      const sessions = await this.getUserSessions(userId);

      // Delete each session
      const deletePromises = sessions.map((session) =>
        this.clearSession(session.sessionId)
      );
      await Promise.all(deletePromises);

      // Clear user sessions list
      const userSessionsKey = `${this.userSessionsPrefix}${userId}`;
      await redisClient.del(userSessionsKey);

      return true;
    } catch (error) {
      console.error("Error clearing user sessions:", error);
      return false;
    }
  }

  // Get session stats
  async getSessionStats(sessionId) {
    try {
      const sessionData = await this.getSessionData(sessionId);
      if (!sessionData) {
        return null;
      }

      const now = new Date();
      const createdAt = new Date(sessionData.createdAt);
      const lastActivity = new Date(sessionData.lastActivity);

      return {
        sessionId,
        userId: sessionData.userId,
        createdAt: sessionData.createdAt,
        lastActivity: sessionData.lastActivity,
        messageCount: sessionData.messageCount || 0,
        duration: now - createdAt,
        timeSinceLastActivity: now - lastActivity,
        isActive: now - lastActivity < 300000, // Active within 5 minutes
      };
    } catch (error) {
      console.error("Error getting session stats:", error);
      return null;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const testSessionId = await this.getOrCreateSession(null);
      const sessionData = await this.getSessionData(testSessionId);
      await this.clearSession(testSessionId);

      return {
        healthy: !!sessionData,
        message: sessionData
          ? "Session manager working"
          : "Session manager failed",
      };
    } catch (error) {
      return {
        healthy: false,
        message: `Session manager error: ${error.message}`,
      };
    }
  }
}

module.exports = new ChatSessionManager();
