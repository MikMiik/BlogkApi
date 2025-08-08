// Test database-based classification system
const chatbotService = require("../services/chatbot.service");
const chatbotTrainingService = require("../services/chatbotTraining.service");

async function testDatabaseSystem() {
  console.log("🧪 Testing Database-Based Smart Classification System...\n");

  try {
    // Test 1: Add some training examples
    console.log("1️⃣ Adding training examples...");

    const trainingExamples = [
      { message: "Tôi quên mật khẩu", agent: "accountAgent", confidence: 1.0 },
      {
        message: "Làm sao để đăng nhập",
        agent: "accountAgent",
        confidence: 0.9,
      },
      { message: "Reset password", agent: "accountAgent", confidence: 0.95 },
      {
        message: "Tôi muốn viết bài mới",
        agent: "postManagementAgent",
        confidence: 1.0,
      },
      {
        message: "Làm sao để publish bài viết",
        agent: "postManagementAgent",
        confidence: 0.9,
      },
      {
        message: "Website load chậm",
        agent: "performanceAgent",
        confidence: 0.9,
      },
      {
        message: "Tối ưu performance",
        agent: "performanceAgent",
        confidence: 0.95,
      },
    ];

    for (const example of trainingExamples) {
      const result = await chatbotTrainingService.addTrainingExample(
        example.message,
        example.agent,
        example.confidence,
        "manual"
      );
      console.log(`✅ Added: "${example.message}" → ${example.agent}`);
    }

    console.log("\n2️⃣ Getting training stats...");
    const stats = await chatbotTrainingService.getTrainingStats();
    console.log("Training Stats:", JSON.stringify(stats, null, 2));

    console.log("\n3️⃣ Testing classification...");

    const testMessages = [
      "Tôi không thể đăng nhập được",
      "Làm sao để tạo bài viết mới",
      "Trang web chậm quá, cần tối ưu",
      "Xin chào, bạn có thể giúp gì cho tôi?",
    ];

    for (const message of testMessages) {
      console.log(`\n📝 Testing: "${message}"`);

      try {
        const result = await chatbotService.send(message, "test_session_db", {
          userId: 1,
          autoTrain: true,
        });

        console.log(`✅ Agent: ${result.metadata.agentName}`);
        console.log(`📊 Confidence: ${result.metadata.confidence}`);
        console.log(`🔍 Method: ${result.metadata.method}`);
        console.log(`💭 Reasoning: ${result.metadata.reasoning}`);
        console.log(`Response: ${result.response.substring(0, 100)}...`);
      } catch (error) {
        console.log(`❌ ERROR: ${error.message}`);
      }
    }

    console.log("\n4️⃣ Getting classification logs...");
    const classificationStats =
      await chatbotTrainingService.getClassificationStats(1); // Last 1 day
    console.log(
      "Classification Stats:",
      JSON.stringify(classificationStats, null, 2)
    );

    console.log("\n5️⃣ Getting method performance...");
    const methodPerformance =
      await chatbotTrainingService.getMethodPerformance();
    console.log(
      "Method Performance:",
      JSON.stringify(methodPerformance, null, 2)
    );

    console.log("\n6️⃣ Retraining all intents...");
    const retrainResults = await chatbotTrainingService.retrainAllIntents();
    console.log("Retrain Results:", JSON.stringify(retrainResults, null, 2));

    console.log("\n7️⃣ Export training data...");
    const exportData = await chatbotTrainingService.exportTrainingData();
    console.log(
      `Exported data contains ${exportData.totalSamples} samples from ${Object.keys(exportData.intents).length} intents`
    );

    console.log("\n✅ Database system test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run tests
testDatabaseSystem().catch(console.error);
