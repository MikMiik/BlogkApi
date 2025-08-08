const chatbotService = require("./chatbotService");
const historyService = require("./historyService");
const trainingService = require("./trainingService");

class ChatbotManager {
  constructor() {
    this.chatbot = chatbotService;
    this.history = historyService;
    this.training = trainingService;
  }

  // Main chat interface
  async send(message, sessionId, options = {}) {
    return await this.chatbot.send(message, sessionId, options);
  }
  // Core chatbot interface - delegate to chatbotService
  async getStats() {
    return await this.chatbot.getStats();
  }

  async exportData() {
    return await this.chatbot.exportData();
  }

  // History management - delegate to historyService
  async getConversationHistory(sessionId, limit = 20) {
    return await this.history.getConversationHistory(sessionId, limit);
  }

  async clearConversationHistory(sessionId) {
    return await this.history.clearConversationHistory(sessionId);
  }

  async getSessionStats(sessionId) {
    return await this.history.getSessionStats(sessionId);
  }

  async getUserSessions(userId, limit = 20) {
    return await this.history.getUserSessions(userId, limit);
  }

  // Training interface - delegate to trainingService
  async trainFromFeedback(
    message,
    correctAgentName,
    sessionId,
    confidence = 1.0
  ) {
    return await this.training.trainFromFeedback(
      message,
      correctAgentName,
      sessionId,
      confidence
    );
  }

  async addTrainingExample(message, agentName, confidence, source) {
    return await this.training.addTrainingExample(
      message,
      agentName,
      confidence,
      source
    );
  }

  async retrainAllIntents() {
    return await this.training.retrainAllIntents();
  }

  async getClassificationStats(days = 7) {
    return await this.training.getClassificationStats(days);
  }

  async getMethodPerformance() {
    return await this.training.getMethodPerformance();
  }

  async getTrainingStats() {
    return await this.training.getTrainingStats();
  }
}

module.exports = new ChatbotManager();
