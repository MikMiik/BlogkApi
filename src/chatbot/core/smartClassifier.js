const openai = require("../utils/openai");
const agentSelector = require("../utils/agentSelector");
const intentTrainer = require("./intentTrainer");
const trainingService = require("../services/trainingService");

class SmartClassifier {
  constructor() {
    this.fallbackToLLM = true;
    this.autoTrain = true;
    this.minConfidenceForAutoTrain = 0.8;
    this.confidenceThreshold = 0.75;
  }

  async classify(message, conversationHistory = [], options = {}) {
    const classificationResult = {
      agentName: "defaultAgent",
      confidence: 0.1,
      method: "default_fallback",
      reasoning: "No classification method succeeded",
      cost: 0,
    };

    try {
      // Priority Step: Check for blog data queries first
      const blogDataResult = await this.checkBlogDataQuery(message);
      if (
        blogDataResult &&
        blogDataResult.confidence >= this.confidenceThreshold
      ) {
        console.log(
          `🔍 Blog data query detected: ${blogDataResult.agentName} (${blogDataResult.confidence.toFixed(2)})`
        );

        classificationResult.agentName = blogDataResult.agentName;
        classificationResult.confidence = blogDataResult.confidence;
        classificationResult.method = "blog_data_detection";
        classificationResult.reasoning = blogDataResult.reasoning;
        return classificationResult;
      }

      // Step 1: Try pattern-based classification first (fast & cheap)
      const patternResult = await intentTrainer.classifyIntent(message);

      if (
        patternResult &&
        patternResult.confidence >= this.confidenceThreshold
      ) {
        console.log(
          `✅ Pattern classification: ${patternResult.intent} (${patternResult.confidence.toFixed(2)})`
        );

        // Auto-train for high confidence results
        if (
          this.autoTrain &&
          patternResult.confidence >= this.minConfidenceForAutoTrain
        ) {
          await intentTrainer.addTrainingExample(
            message,
            patternResult.intent,
            patternResult.confidence
          );
        }

        classificationResult.agentName = patternResult.intent;
        classificationResult.confidence = patternResult.confidence;
        classificationResult.method = "pattern_matching";
        classificationResult.reasoning = `Matched ${Object.keys(patternResult.allScores).length} patterns`;
        classificationResult.cost = 0;

        // Log classification
        await this.logClassification(message, classificationResult, options);
        return classificationResult;
      }

      // Step 2: Try keyword-based classification (agentSelector fallback)
      const keywordAgent = agentSelector.selectAgent(message);
      if (keywordAgent && keywordAgent.systemPrompt) {
        const agentName = this.getAgentName(keywordAgent);
        console.log(`🔍 Keyword classification: ${agentName}`);

        classificationResult.agentName = agentName;
        classificationResult.confidence = 0.6; // Medium confidence for keyword matching
        classificationResult.method = "keyword_matching";
        classificationResult.reasoning = "Matched agent keywords";
        classificationResult.cost = 0;

        // Log classification
        await this.logClassification(message, classificationResult, options);
        return classificationResult;
      }

      // Step 3: Fallback to LLM classification (expensive but accurate)
      if (this.fallbackToLLM) {
        console.log("🤖 Falling back to LLM classification...");
        const llmResult = await this.llmClassify(message, conversationHistory);

        // Auto-train from LLM results if confident
        if (
          this.autoTrain &&
          llmResult.confidence >= this.minConfidenceForAutoTrain
        ) {
          await intentTrainer.addTrainingExample(
            message,
            llmResult.agentName,
            llmResult.confidence
          );
        }

        // Log classification
        await this.logClassification(message, llmResult, options);
        return llmResult;
      }

      // Step 4: Default fallback
      classificationResult.method = "default_fallback";
      classificationResult.reasoning = "No classification method succeeded";

      // Log classification
      await this.logClassification(message, classificationResult, options);
      return classificationResult;
    } catch (error) {
      console.error("Classification error:", error);

      classificationResult.method = "error_fallback";
      classificationResult.reasoning = `Error: ${error.message}`;

      // Log classification
      await this.logClassification(message, classificationResult, options);
      return classificationResult;
    }
  }

  async logClassification(message, result, options = {}) {
    try {
      await trainingService.logClassification({
        message,
        agentName: result.agentName,
        confidence: result.confidence,
        method: result.method,
        reasoning: result.reasoning,
        cost: result.cost || 0,
        sessionId: options.sessionId,
        userId: options.userId,
      });
    } catch (error) {
      console.error("Error logging classification:", error);
      // Don't throw error for logging failures
    }
  }

  async llmClassify(message, conversationHistory = []) {
    try {
      const recentMessages = conversationHistory;
      const contextMessages =
        recentMessages.length > 0
          ? recentMessages.map((msg) => ({
              role: msg.role || "user",
              content: msg.content || msg,
            }))
          : [];

      const systemPrompt = `Bạn là chuyên gia phân loại intent cho BlogkUI platform. Phân tích tin nhắn và chọn agent phù hợp nhất.

AVAILABLE AGENTS:
🔐 User Support:
- accountAgent: Đăng ký, đăng nhập, tài khoản, mật khẩu, xác thực
- postManagementAgent: Viết bài, publish, draft, editor, quản lý bài viết  
- socialAgent: Follow, comment, bookmark, like, tương tác xã hội

🔧 Technical:
- troubleshootingAgent: Lỗi, bug, sự cố, không hoạt động, khắc phục
- performanceAgent: Tốc độ, optimization, hiệu suất, loading

📝 Content:
- writingTipsAgent: Cách viết, cấu trúc bài, technical writing, tips
- analyticsAgent: Thống kê, phân tích, metrics, data, insights

🚀 SEO:
- keywordAgent: Keyword research, từ khóa, search terms
- technicalSeoAgent: Technical SEO, Core Web Vitals, crawling, meta tags
- contentSeoAgent: On-page SEO, content optimization, internal linking

📚 General:
- blogWritingAgent: Creative writing, content ideas, storytelling
- contentAnalysisAgent: General analytics, overview
- seoAgent: General SEO advice  
- technicalAgent: General technical support
- userSupportAgent: General help, support
- defaultAgent: Unclear intent, general conversation

CLASSIFICATION RULES:
1. Analyze user intent from message content
2. Consider conversation context if provided
3. Choose the MOST SPECIFIC agent that matches user need
4. Prefer specialized agents over general ones
5. If multiple agents could work, choose the most precise match

RESPONSE FORMAT:
Return ONLY the agent name, nothing else. Examples:
- "accountAgent"
- "troubleshootingAgent" 
- "keywordAgent"
- "defaultAgent"

Current message to classify:`;

      const response = await openai.send({
        model: "gpt-4o-mini",
        temperature: 0.1,
        max_output_tokens: 50,
        input: [
          { role: "system", content: systemPrompt },
          ...contextMessages,
          { role: "user", content: message },
        ],
      });

      const agentName = response.trim().replace(/['"]/g, "");

      // Validate agent name
      const validAgents = [
        "accountAgent",
        "postManagementAgent",
        "socialAgent",
        "troubleshootingAgent",
        "performanceAgent",
        "writingTipsAgent",
        "analyticsAgent",
        "keywordAgent",
        "technicalSeoAgent",
        "contentSeoAgent",
        "blogWritingAgent",
        "contentAnalysisAgent",
        "seoAgent",
        "technicalAgent",
        "userSupportAgent",
        "defaultAgent",
      ];

      if (!validAgents.includes(agentName)) {
        console.warn(`Invalid agent name from LLM: ${agentName}`);
        return {
          agentName: "defaultAgent",
          confidence: 0.3,
          method: "llm_classification_invalid",
          reasoning: `LLM returned invalid agent: ${agentName}`,
          cost: this.estimateTokenCost(message, contextMessages),
        };
      }

      return {
        agentName,
        confidence: 0.85, // High confidence for LLM results
        method: "llm_classification",
        reasoning: "LLM analyzed intent and context",
        cost: this.estimateTokenCost(message, contextMessages),
      };
    } catch (error) {
      console.error("LLM classification error:", error);
      return {
        agentName: "defaultAgent",
        confidence: 0.2,
        method: "llm_error",
        reasoning: `LLM error: ${error.message}`,
        cost: 0,
      };
    }
  }

  getAgentName(agentObject) {
    // Helper to extract agent name from agentSelector result
    if (!agentObject || !agentObject.systemPrompt) return "defaultAgent";

    // Try to match based on systemPrompt characteristics
    const prompt = agentObject.systemPrompt.toLowerCase();

    if (prompt.includes("đăng nhập") || prompt.includes("account"))
      return "accountAgent";
    if (prompt.includes("viết bài") || prompt.includes("post management"))
      return "postManagementAgent";
    if (prompt.includes("follow") || prompt.includes("social"))
      return "socialAgent";
    if (prompt.includes("troubleshoot") || prompt.includes("debug"))
      return "troubleshootingAgent";
    if (prompt.includes("performance") || prompt.includes("optimization"))
      return "performanceAgent";
    if (prompt.includes("writing tips") || prompt.includes("technical writing"))
      return "writingTipsAgent";
    if (prompt.includes("analytics") && prompt.includes("metrics"))
      return "analyticsAgent";
    if (prompt.includes("keyword research")) return "keywordAgent";
    if (prompt.includes("technical seo") || prompt.includes("core web vitals"))
      return "technicalSeoAgent";
    if (prompt.includes("content seo") || prompt.includes("on-page"))
      return "contentSeoAgent";

    // Fallback to main agents
    if (prompt.includes("creative writing")) return "blogWritingAgent";
    if (prompt.includes("seo")) return "seoAgent";
    if (prompt.includes("technical")) return "technicalAgent";
    if (prompt.includes("support")) return "userSupportAgent";

    return "defaultAgent";
  }

  estimateTokenCost(message, contextMessages = []) {
    // Rough token estimation (4 chars ≈ 1 token for Vietnamese/English mix)
    const messageTokens = Math.ceil(message.length / 4);
    const contextTokens = contextMessages.reduce(
      (total, msg) => total + Math.ceil((msg.content || "").length / 4),
      0
    );
    const systemTokens = Math.ceil(2000 / 4); // Estimated system prompt size

    return messageTokens + contextTokens + systemTokens;
  }

  async getClassificationStats() {
    const trainingStats = await intentTrainer.getTrainingStats();
    return {
      ...trainingStats,
      classifier: {
        fallbackToLLM: this.fallbackToLLM,
        autoTrain: this.autoTrain,
        minConfidenceForAutoTrain: this.minConfidenceForAutoTrain,
      },
    };
  }

  async trainFromExample(message, correctAgent, confidence = 1.0) {
    return await intentTrainer.addTrainingExample(
      message,
      correctAgent,
      confidence
    );
  }

  async exportClassificationData() {
    return await intentTrainer.exportTrainingData();
  }

  // Check if the message is asking for blog data/content
  async checkBlogDataQuery(message) {
    const lowerMessage = message.toLowerCase();

    // Keywords that indicate blog data queries
    const blogDataKeywords = [
      // Vietnamese
      "tác giả",
      "người viết",
      "ai viết",
      "author",
      "bài viết",
      "post",
      "article",
      "blog",
      "tiêu đề",
      "title",
      "tên bài",
      "danh mục",
      "category",
      "chủ đề",
      "thẻ",
      "tag",
      "từ khóa",
      "mới nhất",
      "recent",
      "latest",
      "tìm kiếm",
      "search",
      "tìm",
      "thống kê",
      "stats",
      "số lượng",
      "chi tiết",
      "thông tin",
      "detail",
      // English
      "who wrote",
      "written by",
      "authored by",
      "find post",
      "search article",
      "look for",
      "recent posts",
      "latest articles",
      "blog statistics",
      "post count",
    ];

    // Title patterns (quoted or specific phrases)
    const titlePatterns = [
      /"([^"]+)"/, // Quoted titles
      /conspergo admiratio decor/i, // Specific title mentioned
      /tiêu đề.*?([a-zA-Z0-9\s]+)/i, // Title followed by text
      /title.*?([a-zA-Z0-9\s]+)/i,
    ];

    // Author query patterns
    const authorPatterns = [
      /(tác giả|author|ai viết|người viết).*?(của|bài|post|title)/i,
      /(who wrote|written by|authored by)/i,
      /bài.*?(của|by|tác giả)/i,
    ];

    // Calculate confidence based on keyword matches
    let confidence = 0;
    let matchedKeywords = [];
    let reasoning = "";

    // Check for author queries (high priority)
    for (const pattern of authorPatterns) {
      if (pattern.test(lowerMessage)) {
        confidence = Math.max(confidence, 0.95);
        reasoning = "Author query pattern detected";
        matchedKeywords.push("author_query");
        break;
      }
    }

    // Check for title patterns (high priority)
    for (const pattern of titlePatterns) {
      if (pattern.test(lowerMessage)) {
        confidence = Math.max(confidence, 0.9);
        reasoning = reasoning || "Title pattern detected";
        matchedKeywords.push("title_pattern");
        break;
      }
    }

    // Check for general blog data keywords
    for (const keyword of blogDataKeywords) {
      if (lowerMessage.includes(keyword)) {
        confidence += 0.1;
        matchedKeywords.push(keyword);
      }
    }

    // Bonus for multiple keyword matches
    if (matchedKeywords.length >= 2) {
      confidence += 0.2;
    }

    // Cap confidence at 1.0
    confidence = Math.min(confidence, 1.0);

    // Only return if confidence is above threshold
    if (confidence >= 0.75) {
      return {
        agentName: "blogDataAgent",
        confidence,
        reasoning:
          reasoning ||
          `Matched ${matchedKeywords.length} blog data keywords: ${matchedKeywords.slice(0, 3).join(", ")}`,
      };
    }

    return null;
  }
}

module.exports = new SmartClassifier();
