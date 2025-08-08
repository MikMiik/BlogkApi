// Test smart classification system
const smartClassifier = require("./utils/smartClassifier");
const chatbotService = require("../services/chatbot.service");

async function testClassificationSystem() {
  console.log("🧪 Testing Smart Classification System...\n");

  const testCases = [
    {
      message: "Tôi quên mật khẩu, làm sao để reset?",
      expectedAgent: "accountAgent",
      category: "User Support",
    },
    {
      message: "Làm thế nào để viết bài và publish lên blog?",
      expectedAgent: "postManagementAgent",
      category: "User Support",
    },
    {
      message: "Website load chậm quá, làm sao tối ưu performance?",
      expectedAgent: "performanceAgent",
      category: "Technical",
    },
    {
      message: "Tôi muốn research từ khóa cho bài viết technical",
      expectedAgent: "keywordAgent",
      category: "SEO",
    },
    {
      message: "Làm sao để viết technical content hay và engaging?",
      expectedAgent: "writingTipsAgent",
      category: "Content",
    },
    {
      message: "Xin chào, bạn có thể giúp gì cho tôi?",
      expectedAgent: "defaultAgent",
      category: "General",
    },
  ];

  for (const testCase of testCases) {
    console.log(`📝 Testing: "${testCase.message}"`);
    console.log(
      `🎯 Expected: ${testCase.expectedAgent} (${testCase.category})`
    );

    try {
      // Test classification only
      const classificationResult = await smartClassifier.classify(
        testCase.message
      );

      console.log(`✅ Result: ${classificationResult.agentName}`);
      console.log(
        `📊 Confidence: ${classificationResult.confidence.toFixed(2)}`
      );
      console.log(`🔍 Method: ${classificationResult.method}`);
      console.log(`💭 Reasoning: ${classificationResult.reasoning}`);
      console.log(`💰 Est. Cost: ${classificationResult.cost} tokens`);

      const isCorrect =
        classificationResult.agentName === testCase.expectedAgent;
      console.log(
        `${isCorrect ? "✅" : "❌"} ${isCorrect ? "CORRECT" : "INCORRECT"}`
      );
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }

    console.log("─".repeat(60));
  }

  // Test full chatbot service
  console.log("\n🤖 Testing Full Chatbot Service...\n");

  try {
    const result = await chatbotService.send(
      "Tôi cần hướng dẫn về cách tối ưu keyword cho bài viết",
      "test_session_1"
    );

    console.log("Response:", result.response);
    console.log("Metadata:", result.metadata);
  } catch (error) {
    console.log("Service Error:", error.message);
  }

  // Get system stats
  console.log("\n📊 System Statistics...\n");
  try {
    const stats = await chatbotService.getStats();
    console.log(
      "Classification Stats:",
      JSON.stringify(stats.classification, null, 2)
    );
    console.log(
      "Router Stats:",
      JSON.stringify(stats.routing.categories, null, 2)
    );
  } catch (error) {
    console.log("Stats Error:", error.message);
  }
}

// Run tests
testClassificationSystem().catch(console.error);
