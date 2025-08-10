const {
  ChatbotIntent,
  ChatbotTrainingExample,
  ChatbotPattern,
  ChatbotClassificationLog,
} = require("@/models");
const { Op } = require("sequelize");

class ChatbotTrainingService {
  constructor() {
    this.confidenceThreshold = 0.75; //Ngưỡng tin cậy tối thiểu để phân loại
    this.minTrainingData = 10; // Minimum samples per intent
  }

  // Training from feedback
  async trainFromFeedback(
    message,
    correctAgentName,
    sessionId,
    confidence = 1.0
  ) {
    try {
      const result = await this.addTrainingExample(
        message,
        correctAgentName,
        confidence,
        "feedback"
      );
      return {
        success: true,
        message: "Training example added successfully",
        result,
      };
    } catch (error) {
      console.error("Training error:", error);
      return { success: false, error: error.message };
    }
  }

  // Intent Management
  async findOrCreateIntent(agentName) {
    try {
      const result = await ChatbotIntent.findOrCreateByAgentName(agentName);
      return result;
    } catch (error) {
      console.error("Error finding/creating intent:", error);
      throw new Error("Failed to find or create intent");
    }
  }

  async getActiveIntents() {
    try {
      return await ChatbotIntent.getActiveIntents();
    } catch (error) {
      console.error("Error getting active intents:", error);
      throw new Error("Failed to get active intents");
    }
  }

  // Training Example Management
  async addTrainingExample(
    message,
    agentName,
    confidence = 1.0,
    source = "user_interaction"
  ) {
    try {
      // Find or create intent
      const { intent } = await this.findOrCreateIntent(agentName);

      // Check for duplicates
      const existingExample = await ChatbotTrainingExample.findOne({
        where: {
          intentId: intent.id,
          text: message.toLowerCase().trim(),
          isActive: true,
        },
      });

      if (existingExample) {
        // Update confidence if new one is higher
        if (confidence > existingExample.confidence) {
          await existingExample.update({ confidence, source });
        }
        return existingExample;
      }

      // Create new example
      const example = await ChatbotTrainingExample.create({
        intentId: intent.id,
        text: message.toLowerCase().trim(),
        confidence,
        source,
        isActive: true,
      });

      // Update intent stats manually
      const totalExamples = await ChatbotTrainingExample.count({
        where: {
          intentId: intent.id,
          isActive: true,
        },
      });

      const totalPatterns = await ChatbotPattern.count({
        where: {
          intentId: intent.id,
          isActive: true,
        },
      });

      await intent.update({
        totalExamples,
        totalPatterns,
        updatedAt: new Date(),
      });

      // Auto-train if we have enough data
      if (totalExamples >= this.minTrainingData) {
        await this.trainIntent(agentName);
      }

      return example;
    } catch (error) {
      console.error("Error adding training example:", error);
      throw new Error("Failed to add training example");
    }
  }

  async getTrainingExamples(agentName, limit = 100) {
    try {
      return await ChatbotTrainingExample.findByIntentName(agentName);
    } catch (error) {
      console.error("Error getting training examples:", error);
      throw new Error("Failed to get training examples");
    }
  }

  // Pattern Training
  async trainIntent(agentName) {
    try {
      const { intent } = await this.findOrCreateIntent(agentName);

      const examples = await ChatbotTrainingExample.findAll({
        where: {
          intentId: intent.id,
          isActive: true,
        },
      });

      if (examples.length < this.minTrainingData) {
        console.log(
          `Not enough training data for ${agentName}: ${examples.length} examples`
        );
        return false;
      }

      // Calculate keyword frequencies
      const keywordFreq = {};
      const totalExamples = examples.length;

      examples.forEach((example) => {
        const keywords = this.extractKeywords(example.text);
        keywords.forEach((keyword) => {
          keywordFreq[keyword] =
            (keywordFreq[keyword] || 0) + example.confidence;
        });
      });

      // Update patterns
      const patterns = await ChatbotPattern.updatePatternScores(
        intent.id,
        keywordFreq,
        totalExamples
      );

      // Update intent training status
      await intent.update({
        lastTrained: new Date(),
        totalPatterns: patterns.length,
      });

      console.log(
        `Trained intent: ${agentName} with ${patterns.length} patterns`
      );
      return true;
    } catch (error) {
      console.error("Error training intent:", error);
      throw new Error("Failed to train intent");
    }
  }

  extractKeywords(text) {
    const stopWords = new Set([
      "tôi",
      "bạn",
      "là",
      "có",
      "được",
      "và",
      "để",
      "trong",
      "với",
      "của",
      "này",
      "đó",
      "không",
      "thì",
      "sẽ",
      "đã",
      "i",
      "you",
      "is",
      "are",
      "the",
      "and",
      "to",
      "in",
      "with",
      "for",
      "this",
      "that",
      "not",
      "can",
      "will",
      "have",
      "has",
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word))
      .filter((word) => !word.match(/^\d+$/)); // Remove pure numbers
  }

  // Classification
  async classifyIntent(message) {
    try {
      const text = message.toLowerCase().trim();
      const intents = await this.getActiveIntents();
      const scores = {};

      // Calculate scores for each intent
      for (const intent of intents) {
        if (!intent.patterns || intent.patterns.length === 0) {
          scores[intent.agentName] = 0;
          continue;
        }

        let score = 0;
        let matchedPatterns = 0;

        // Check pattern matches
        intent.patterns.forEach((pattern) => {
          if (text.includes(pattern.keyword)) {
            score += pattern.score;
            matchedPatterns++;
          }
        });

        // Normalize score based on pattern density
        if (matchedPatterns > 0) {
          scores[intent.agentName] =
            (score / intent.patterns.length) *
            (matchedPatterns / intent.patterns.length);
          // Tỉ lệ điểm so với tổng số patterns của intent hay Tỉ lệ số lượng từ khóa khớp so với tổng số patterns
          // Điểm cuối = (điểm trung bình mỗi pattern) × (tỉ lệ pattern khớp)
        } else {
          scores[intent.agentName] = 0;
        }
      }

      // Find best match
      const bestIntent = Object.entries(scores).sort(
        ([, a], [, b]) => b - a
      )[0];

      if (bestIntent && bestIntent[1] >= this.confidenceThreshold) {
        return {
          intent: bestIntent[0],
          confidence: bestIntent[1],
          allScores: scores,
          method: "pattern_matching",
        };
      }

      return null; // No confident classification
    } catch (error) {
      console.error("Error classifying intent:", error);
      return null;
    }
  }

  // Statistics and Analytics
  async getTrainingStats() {
    try {
      const intents = await ChatbotIntent.getTrainingStats();

      const stats = {
        totalIntents: intents.length,
        totalSamples: 0,
        lastUpdated: null,
        intentBreakdown: {},
      };

      intents.forEach((intent) => {
        const exampleCount = intent.examples ? intent.examples.length : 0;
        const patternCount = intent.patterns ? intent.patterns.length : 0;

        stats.totalSamples += exampleCount;

        if (
          intent.updatedAt &&
          (!stats.lastUpdated || intent.updatedAt > stats.lastUpdated)
        ) {
          stats.lastUpdated = intent.updatedAt;
        }

        stats.intentBreakdown[intent.agentName] = {
          examples: exampleCount,
          patterns: patternCount,
          lastTrained: intent.lastTrained,
          needsTraining:
            exampleCount >= this.minTrainingData && !intent.lastTrained,
        };
      });

      return stats;
    } catch (error) {
      console.error("Error getting training stats:", error);
      throw new Error("Failed to get training stats");
    }
  }

  async getClassificationStats(days = 7) {
    try {
      return await ChatbotClassificationLog.getClassificationStats(days);
    } catch (error) {
      console.error("Error getting classification stats:", error);
      throw new Error("Failed to get classification stats");
    }
  }

  async getMethodPerformance() {
    try {
      return await ChatbotClassificationLog.getMethodPerformance();
    } catch (error) {
      console.error("Error getting method performance:", error);
      throw new Error("Failed to get method performance");
    }
  }

  // Logging
  async logClassification(classificationData) {
    try {
      return await ChatbotClassificationLog.logClassification(
        classificationData
      );
    } catch (error) {
      console.error("Error logging classification:", error);
      // Don't throw error for logging failures
      return null;
    }
  }

  // Data Export/Import
  async exportTrainingData() {
    try {
      const intents = await this.getActiveIntents();
      const stats = await this.getTrainingStats();

      const exportData = {
        intents: {},
        lastUpdated: new Date().toISOString(),
        totalSamples: stats.totalSamples,
        exportedAt: new Date().toISOString(),
        stats,
      };

      intents.forEach((intent) => {
        exportData.intents[intent.agentName] = {
          examples: intent.examples.map((ex) => ({
            text: ex.text,
            confidence: parseFloat(ex.confidence),
            source: ex.source,
            timestamp: ex.createdAt,
          })),
          patterns: intent.patterns.map((pattern) => ({
            keyword: pattern.keyword,
            score: parseFloat(pattern.score),
            frequency: pattern.frequency,
          })),
          lastTrained: intent.lastTrained,
        };
      });

      return exportData;
    } catch (error) {
      console.error("Error exporting training data:", error);
      throw new Error("Failed to export training data");
    }
  }

  async importTrainingData(importData) {
    try {
      if (!importData.intents || typeof importData.intents !== "object") {
        throw new Error("Invalid training data structure");
      }

      const results = [];

      for (const [agentName, intentData] of Object.entries(
        importData.intents
      )) {
        const { intent } = await this.findOrCreateIntent(agentName);

        // Import examples
        if (intentData.examples && Array.isArray(intentData.examples)) {
          for (const example of intentData.examples) {
            await this.addTrainingExample(
              example.text,
              agentName,
              example.confidence || 1.0,
              example.source || "manual"
            );
          }
        }

        results.push({
          agentName,
          examplesImported: intentData.examples?.length || 0,
          patternsImported: intentData.patterns?.length || 0,
        });
      }

      return results;
    } catch (error) {
      console.error("Error importing training data:", error);
      throw new Error("Failed to import training data");
    }
  }

  // Cleanup and Maintenance
  async cleanupOldLogs(days = 30) {
    try {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const deletedCount = await ChatbotClassificationLog.destroy({
        where: {
          createdAt: {
            [Op.lt]: cutoffDate,
          },
        },
      });

      console.log(`Cleaned up ${deletedCount} old classification logs`);
      return deletedCount;
    } catch (error) {
      console.error("Error cleaning up old logs:", error);
      throw new Error("Failed to cleanup old logs");
    }
  }

  async retrainAllIntents() {
    try {
      const intents = await ChatbotIntent.findAll({
        where: { isActive: true },
      });

      const results = [];

      for (const intent of intents) {
        const success = await this.trainIntent(intent.agentName);
        results.push({
          agentName: intent.agentName,
          success,
          totalExamples: intent.totalExamples,
        });
      }

      return results;
    } catch (error) {
      console.error("Error retraining all intents:", error);
      throw new Error("Failed to retrain all intents");
    }
  }
}

module.exports = new ChatbotTrainingService();
