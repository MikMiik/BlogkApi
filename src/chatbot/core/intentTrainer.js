const trainingService = require("../services/trainingService");

class IntentTrainer {
  constructor() {
    this.confidenceThreshold = 0.75;
    this.minTrainingData = 10; // Minimum samples per intent
  }

  // Use database instead of file operations
  async addTrainingExample(
    message,
    agentName,
    confidence = 1.0,
    source = "user_interaction"
  ) {
    try {
      return await trainingService.addTrainingExample(
        message,
        agentName,
        confidence,
        source
      );
    } catch (error) {
      console.error("Error adding training example:", error);
      return false;
    }
  }

  async classifyIntent(message) {
    try {
      return await trainingService.classifyIntent(message);
    } catch (error) {
      console.error("Error classifying intent:", error);
      return null;
    }
  }

  async trainIntent(agentName) {
    try {
      return await trainingService.trainIntent(agentName);
    } catch (error) {
      console.error("Error training intent:", error);
      return false;
    }
  }

  async getTrainingStats() {
    try {
      const stats = await trainingService.getTrainingStats();
      return {
        ...stats,
        classifier: {
          confidenceThreshold: this.confidenceThreshold,
          minTrainingData: this.minTrainingData,
        },
      };
    } catch (error) {
      console.error("Error getting training stats:", error);
      return {
        totalIntents: 0,
        totalSamples: 0,
        lastUpdated: null,
        intentBreakdown: {},
        classifier: {
          confidenceThreshold: this.confidenceThreshold,
          minTrainingData: this.minTrainingData,
        },
      };
    }
  }

  async exportTrainingData() {
    try {
      return await trainingService.exportTrainingData();
    } catch (error) {
      console.error("Error exporting training data:", error);
      throw new Error("Failed to export training data");
    }
  }

  async importTrainingData(importData) {
    try {
      return await trainingService.importTrainingData(importData);
    } catch (error) {
      console.error("Error importing training data:", error);
      return false;
    }
  }

  // Legacy methods for backward compatibility
  extractKeywords(text) {
    return trainingService.extractKeywords(text);
  }

  // Additional utility methods
  async getTrainingExamples(agentName, limit = 100) {
    try {
      return await trainingService.getTrainingExamples(agentName, limit);
    } catch (error) {
      console.error("Error getting training examples:", error);
      return [];
    }
  }

  async retrainAllIntents() {
    try {
      return await trainingService.retrainAllIntents();
    } catch (error) {
      console.error("Error retraining all intents:", error);
      return [];
    }
  }

  async cleanupOldData(days = 30) {
    try {
      return await trainingService.cleanupOldLogs(days);
    } catch (error) {
      console.error("Error cleaning up old data:", error);
      return 0;
    }
  }

  // Database-specific methods
  async getClassificationStats(days = 7) {
    try {
      return await trainingService.getClassificationStats(days);
    } catch (error) {
      console.error("Error getting classification stats:", error);
      return [];
    }
  }

  async getMethodPerformance() {
    try {
      return await trainingService.getMethodPerformance();
    } catch (error) {
      console.error("Error getting method performance:", error);
      return [];
    }
  }
}

module.exports = new IntentTrainer();
