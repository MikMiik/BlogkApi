const chatbotService = require("@/chatbot/services/chatbotService");
const sessionManager = require("@/chatbot/services/sessionManager");
const historyService = require("@/chatbot/services/historyService");
const trainingService = require("@/chatbot/services/trainingService");
const getCurrentUser = require("@/utils/getCurrentUser");
const pusher = require("@/configs/pusher");

exports.send = async (req, res) => {
  const { message, options = {} } = req.body;
  const sessionId = req.headers["x-chatbot-session-id"] || null;

  if (!message) {
    return res.error(400, "Message is required");
  }

  try {
    // Get current user if authenticated
    const userId = getCurrentUser();

    // Merge options with user info
    const chatOptions = {
      userId,
      includeContext: true,
      autoTrain: true,
      ...options,
    };

    const result = await chatbotService.send(
      message,
      sessionId, // Pass sessionId from header or null for new session
      chatOptions
    );

    // Trigger websocket event for real-time chat updates
    try {
      await pusher.trigger(
        `chatbot-session-${result.sessionId}`,
        "new-message",
        {
          sessionId: result.sessionId,
          userMessage: { role: "user", content: message },
          botResponse: { role: "assistant", content: result.response },
          metadata: result.metadata,
          timestamp: new Date().toISOString(),
        }
      );
    } catch (pusherError) {
      console.error("Pusher trigger error:", pusherError);
      // Don't fail the request if pusher fails
    }

    res.success(200, {
      response: result.response,
      sessionId: result.sessionId, // Return managed sessionId
      metadata: result.metadata,
    });
  } catch (error) {
    console.error("Error processing message:", error);
    return res.error(500, "Internal Server Error");
  }
};

exports.trainFromFeedback = async (req, res) => {
  const { message, correctAgent, confidence = 1.0 } = req.body;
  const sessionId = req.headers["x-chatbot-session-id"] || "manual_training";

  if (!message || !correctAgent) {
    return res.error(400, "Message and correctAgent are required");
  }

  try {
    const result = await trainingService.trainFromFeedback(
      message,
      correctAgent,
      sessionId,
      confidence
    );

    res.success(200, result);
  } catch (error) {
    console.error("Error training from feedback:", error);
    return res.error(500, "Failed to train from feedback");
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await chatbotService.getStats();
    res.success(200, stats);
  } catch (error) {
    console.error("Error getting stats:", error);
    return res.error(500, "Failed to get stats");
  }
};

exports.getClassificationStats = async (req, res) => {
  const { days = 7 } = req.query;

  try {
    const stats = await chatbotManager.getClassificationStats(parseInt(days));
    res.success(200, stats);
  } catch (error) {
    console.error("Error getting classification stats:", error);
    return res.error(500, "Failed to get classification stats");
  }
};

exports.getMethodPerformance = async (req, res) => {
  try {
    const performance = await chatbotManager.getMethodPerformance();
    res.success(200, performance);
  } catch (error) {
    console.error("Error getting method performance:", error);
    return res.error(500, "Failed to get method performance");
  }
};

exports.getTrainingStats = async (req, res) => {
  try {
    const stats = await chatbotManager.getTrainingStats();
    res.success(200, stats);
  } catch (error) {
    console.error("Error getting training stats:", error);
    return res.error(500, "Failed to get training stats");
  }
};

exports.exportTrainingData = async (req, res) => {
  try {
    const data = await chatbotManager.exportData();
    res.success(200, data);
  } catch (error) {
    console.error("Error exporting data:", error);
    return res.error(500, "Failed to export data");
  }
};

exports.clearConversationHistory = async (req, res) => {
  const { sessionId } = req.body;

  try {
    const result = await chatbotManager.clearConversationHistory(sessionId);
    res.success(200, result);
  } catch (error) {
    console.error("Error clearing history:", error);
    return res.error(500, "Failed to clear conversation history");
  }
};

exports.retrainAllIntents = async (req, res) => {
  try {
    const results = await chatbotManager.retrainAllIntents();
    res.success(200, results);
  } catch (error) {
    console.error("Error retraining intents:", error);
    return res.error(500, "Failed to retrain intents");
  }
};

exports.addTrainingExample = async (req, res) => {
  const { message, agentName, confidence = 1.0, source = "manual" } = req.body;

  if (!message || !agentName) {
    return res.error(400, "Message and agentName are required");
  }

  try {
    const result = await trainingService.addTrainingExample(
      message,
      agentName,
      confidence,
      source
    );

    res.success(201, result);
  } catch (error) {
    console.error("Error adding training example:", error);
    return res.error(500, "Failed to add training example");
  }
};

exports.getConversationHistory = async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.error(400, "Session ID is required");
  }

  try {
    const history = await historyService.getRecentHistory(sessionId, 20);
    const sessionStats = await sessionManager.getSessionStats(sessionId);

    res.success(200, {
      sessionId,
      history,
      stats: sessionStats,
      totalMessages: history.length,
    });
  } catch (error) {
    console.error("Error getting conversation history:", error);
    return res.error(500, "Failed to get conversation history");
  }
};

exports.getSessionStats = async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.error(400, "Session ID is required");
  }

  try {
    const stats = await sessionManager.getSessionStats(sessionId);
    if (!stats) {
      return res.error(404, "Session not found");
    }
    res.success(200, { sessionId, stats });
  } catch (error) {
    console.error("Error getting session stats:", error);
    return res.error(500, "Failed to get session stats");
  }
};

// New session management endpoints
exports.createSession = async (req, res) => {
  try {
    const userId = getCurrentUser();
    const sessionId = await sessionManager.getOrCreateSession(userId);

    res.success(201, {
      sessionId,
      message: "Session created successfully",
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return res.error(500, "Failed to create session");
  }
};

exports.getUserSessions = async (req, res) => {
  try {
    const userId = getCurrentUser();
    if (!userId) {
      return res.error(401, "Authentication required");
    }

    const { limit = 10 } = req.query;
    const sessions = await sessionManager.getUserSessions(
      userId,
      parseInt(limit)
    );

    res.success(200, {
      userId,
      sessions,
      totalSessions: sessions.length,
    });
  } catch (error) {
    console.error("Error getting user sessions:", error);
    return res.error(500, "Failed to get user sessions");
  }
};

exports.clearSession = async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.error(400, "Session ID is required");
  }

  try {
    // Clear session from Redis
    const result = await sessionManager.clearSession(sessionId);

    // Also clear chat history from database
    await historyService.clearSession(sessionId);

    if (result) {
      res.success(200, { message: "Session cleared successfully" });
    } else {
      res.error(404, "Session not found or already cleared");
    }
  } catch (error) {
    console.error("Error clearing session:", error);
    return res.error(500, "Failed to clear session");
  }
};

exports.clearUserSessions = async (req, res) => {
  try {
    const userId = getCurrentUser();
    if (!userId) {
      return res.error(401, "Authentication required");
    }

    const result = await sessionManager.clearUserSessions(userId);
    if (result) {
      res.success(200, { message: "All user sessions cleared successfully" });
    } else {
      res.error(500, "Failed to clear user sessions");
    }
  } catch (error) {
    console.error("Error clearing user sessions:", error);
    return res.error(500, "Failed to clear user sessions");
  }
};
