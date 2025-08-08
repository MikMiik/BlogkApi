const chatbotManager = require("@/chatbot/services/index");
const getCurrentUser = require("@/utils/getCurrentUser");

exports.send = async (req, res) => {
  const { message, sessionId, options = {} } = req.body;

  if (!message) {
    return res.error(400, "Message is required");
  }

  try {
    // Get current user if authenticated
    const userId = getCurrentUser();

    // Generate sessionId if not provided
    const chatSessionId =
      sessionId || `session_${userId || "anonymous"}_${Date.now()}`;

    // Merge options with user info
    const chatOptions = {
      userId,
      includeContext: true,
      autoTrain: true,
      ...options,
    };

    const result = await chatbotManager.send(
      message,
      chatSessionId,
      chatOptions
    );

    res.success(200, {
      response: result.response,
      sessionId: chatSessionId,
      metadata: result.metadata,
    });
  } catch (error) {
    console.error("Error processing message:", error);
    return res.error(500, "Internal Server Error");
  }
};

exports.trainFromFeedback = async (req, res) => {
  const { message, correctAgent, confidence = 1.0, sessionId } = req.body;

  if (!message || !correctAgent) {
    return res.error(400, "Message and correctAgent are required");
  }

  try {
    const result = await chatbotManager.trainFromFeedback(
      message,
      correctAgent,
      sessionId || "manual_training",
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
    const stats = await chatbotManager.getStats();
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
    const result = await chatbotManager.addTrainingExample(
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
    const history = await chatbotManager.getConversationHistory(sessionId, 20);
    const stats = await chatbotManager.getSessionStats(sessionId);

    res.success(200, {
      sessionId,
      history,
      stats,
      totalMessages: history.length,
    });
  } catch (error) {
    console.error("Error getting conversation history:", error);
    return res.error(500, "Failed to get conversation history");
  }
};

exports.getUserSessions = async (req, res) => {
  const { userId } = req.params;
  const { limit = 20 } = req.query;

  if (!userId) {
    return res.error(400, "User ID is required");
  }

  try {
    const sessions = await chatbotManager.getUserSessions(
      userId,
      parseInt(limit)
    );
    res.success(200, { userId, sessions, totalSessions: sessions.length });
  } catch (error) {
    console.error("Error getting user sessions:", error);
    return res.error(500, "Failed to get user sessions");
  }
};

exports.getSessionStats = async (req, res) => {
  const { sessionId } = req.params;

  if (!sessionId) {
    return res.error(400, "Session ID is required");
  }

  try {
    const stats = await chatbotManager.getSessionStats(sessionId);
    res.success(200, { sessionId, stats });
  } catch (error) {
    console.error("Error getting session stats:", error);
    return res.error(500, "Failed to get session stats");
  }
};
