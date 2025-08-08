const smartClassifier = require("./smartClassifier");

/**
 * Legacy intentClassifier - now uses SmartClassifier
 * Maintains backward compatibility while adding intelligent features
 */
async function intentClassifier(messages, options = {}) {
  try {
    // Convert messages to the format expected by smartClassifier
    const lastMessage =
      Array.isArray(messages) && messages.length > 0
        ? messages[messages.length - 1]?.content ||
          messages[messages.length - 1]
        : messages;

    if (!lastMessage) {
      return "defaultAgent";
    }

    // Use smartClassifier for intelligent classification
    const result = await smartClassifier.classify(lastMessage, messages);

    // Log classification details for debugging
    if (options.debug) {
      console.log("Classification result:", {
        agentName: result.agentName,
        confidence: result.confidence,
        method: result.method,
        reasoning: result.reasoning,
        estimatedCost: result.cost,
      });
    }

    return result.agentName;
  } catch (error) {
    console.error("Intent classification error:", error);
    return "defaultAgent";
  }
}

// Export both the function and the classifier for advanced usage
intentClassifier.smartClassifier = smartClassifier;
intentClassifier.classify = async (message, conversationHistory, options) => {
  return await smartClassifier.classify(message, conversationHistory);
};
intentClassifier.train = async (message, agentName, confidence) => {
  return await smartClassifier.trainFromExample(message, agentName, confidence);
};
intentClassifier.getStats = async () => {
  return await smartClassifier.getClassificationStats();
};

module.exports = intentClassifier;
