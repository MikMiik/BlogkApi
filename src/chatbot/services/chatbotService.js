const openai = require("../utils/openai");
const smartClassifier = require("../core/smartClassifier");
const agentRouter = require("../core/agentRouter");
const intentTrainer = require("../core/intentTrainer");
const historyService = require("./historyService");

class ChatbotService {
  constructor() {
    this.maxHistoryLength = 5; // Keep last 5 messages for context
  }

  async send(message, sessionId = "default", options = {}) {
    if (!message) {
      throw new Error("Message is required");
    }

    try {
      // Get conversation history for context
      const historyRecords = await historyService.getRecentHistory(
        sessionId,
        this.maxHistoryLength
      );
      const history = historyRecords.map((record) => record.messageContent);

      // Check if this is the first message in the conversation
      const isFirstMessage = history.length === 0;

      let classificationResult;

      if (isFirstMessage) {
        // For first message, always use defaultAgent to greet and ask for needs
        console.log(
          "👋 First message detected, using defaultAgent for greeting"
        );
        classificationResult = {
          agentName: "defaultAgent",
          confidence: 1.0,
          method: "first_message_greeting",
          reasoning: "First message in conversation - greeting user",
          cost: 0,
        };
      } else {
        // For subsequent messages, classify intent using smart classifier
        classificationResult = await smartClassifier.classify(
          message,
          history,
          {
            sessionId,
            userId: options.userId,
          }
        );
      }

      // Get agent configuration
      const agentConfig = agentRouter.getAgentConfig(
        classificationResult.agentName
      );

      // Prepare conversation context
      const contextMessages = [
        { role: "system", content: agentConfig.systemPrompt },
      ];

      // Add conversation history if available
      if (history.length > 0 && options.includeContext !== false) {
        contextMessages.push(...history);
      }

      // Add current user message
      const userMessage = { role: "user", content: message };
      contextMessages.push(userMessage);

      // Save user message
      await historyService.saveMessage(
        sessionId,
        options.userId,
        userMessage,
        "user",
        classificationResult.agentName,
        {
          confidence: classificationResult.confidence,
          classificationMethod: classificationResult.method,
          estimatedCost: classificationResult.cost,
          reasoning: classificationResult.reasoning,
          timestamp: new Date().toISOString(),
        }
      );

      // Send to OpenAI
      const response = await openai.send({
        input: contextMessages,
        temperature: agentConfig.settings.temperature,
        max_output_tokens: agentConfig.settings.max_output_tokens,
        model: agentConfig.settings.model,
      });

      // Save assistant response
      const assistantMessage = { role: "assistant", content: response };
      await historyService.saveMessage(
        sessionId,
        options.userId,
        assistantMessage,
        "assistant",
        classificationResult.agentName,
        {
          confidence: classificationResult.confidence,
          classificationMethod: classificationResult.method,
          estimatedCost: 0,
          originalQuery: message,
          processingTime: new Date().toISOString(),
          model: agentConfig.settings.model,
        }
      );

      // Auto-train on successful interactions (skip for first message greetings)
      if (
        options.autoTrain !== false &&
        classificationResult.confidence >= 0.8 &&
        classificationResult.method !== "first_message_greeting"
      ) {
        await intentTrainer.addTrainingExample(
          message,
          classificationResult.agentName,
          classificationResult.confidence,
          "user_interaction"
        );
      }

      return {
        response,
        metadata: {
          agentName: classificationResult.agentName,
          confidence: classificationResult.confidence,
          method: classificationResult.method,
          reasoning: classificationResult.reasoning,
          estimatedCost: classificationResult.cost,
          sessionId,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Error sending message", error);
      return this._handleFallback(message, sessionId, options, error);
    }
  }

  async _handleFallback(message, sessionId, options, originalError) {
    try {
      const fallbackConfig = agentRouter.getAgentConfig("defaultAgent");
      const fallbackResponse = await openai.send({
        input: [
          { role: "system", content: fallbackConfig.systemPrompt },
          { role: "user", content: message },
        ],
        temperature: fallbackConfig.settings.temperature,
        max_output_tokens: fallbackConfig.settings.max_output_tokens,
        model: fallbackConfig.settings.model,
      });

      // Save fallback interaction
      const userMessage = { role: "user", content: message };
      const assistantMessage = { role: "assistant", content: fallbackResponse };

      await historyService.saveMessage(
        sessionId,
        options.userId,
        userMessage,
        "user",
        "defaultAgent",
        {
          confidence: 0.1,
          classificationMethod: "error_fallback",
          estimatedCost: 0,
          error: originalError.message,
          fallback: true,
        }
      );

      await historyService.saveMessage(
        sessionId,
        options.userId,
        assistantMessage,
        "assistant",
        "defaultAgent",
        {
          confidence: 0.1,
          classificationMethod: "error_fallback",
          estimatedCost: 0,
          error: originalError.message,
          fallback: true,
        }
      );

      return {
        response: fallbackResponse,
        metadata: {
          agentName: "defaultAgent",
          confidence: 0.1,
          method: "error_fallback",
          reasoning: `Original error: ${originalError.message}`,
          estimatedCost: 0,
          sessionId,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (fallbackError) {
      console.error("Fallback also failed", fallbackError);
      throw new Error(
        "Failed to send message - both primary and fallback failed"
      );
    }
  }

  async exportData() {
    try {
      const trainingData = await smartClassifier.exportClassificationData();
      const stats = await this.getStats();

      return {
        trainingData,
        stats,
        exportedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Export error:", error);
      throw new Error("Failed to export data");
    }
  }

  async getStats() {
    try {
      const classificationStats =
        await smartClassifier.getClassificationStats();
      const routerStats = agentRouter.getSystemStats();
      const overallStats = await historyService.getOverallStats();

      return {
        classification: classificationStats,
        routing: routerStats,
        sessions: overallStats,
      };
    } catch (error) {
      console.error("Stats error:", error);
      return { error: error.message };
    }
  }
}

module.exports = new ChatbotService();
