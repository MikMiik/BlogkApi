const { trainBlogDataAgent } = require("./training/blogDataTraining");

async function testBlogDataSystem() {
  console.log("🔧 Testing Blog Data System...");

  try {
    // 1. Train the BlogDataAgent first
    console.log("\n📚 Step 1: Training BlogDataAgent...");
    await trainBlogDataAgent();
    console.log("✅ Training completed!");

    // 2. Test the system components
    console.log("\n🧪 Step 2: Testing system components...");

    // Test smartClassifier blog data detection
    const smartClassifier = require("./core/smartClassifier");

    const testQueries = [
      "tác giả của bài viết Conspergo admiratio decor là ai",
      "ai viết bài JavaScript Tips",
      "bài viết mới nhất",
      "tìm bài về react",
    ];

    for (const query of testQueries) {
      const result = await smartClassifier.checkBlogDataQuery(query);
      console.log(`📝 Query: "${query}"`);
      console.log(
        `   Result: ${result ? `${result.agentName} (${result.confidence.toFixed(2)})` : "No match"}`
      );
    }

    // 3. Test BlogDataAgent directly
    console.log("\n🎯 Step 3: Testing BlogDataAgent...");
    const BlogDataAgent = require("./agents/data/blogDataAgent");
    const blogAgent = new BlogDataAgent();

    const testTitle = "Conspergo admiratio decor";
    console.log(`🔍 Testing with title: "${testTitle}"`);

    try {
      const result = await blogAgent.findAuthorByTitle(testTitle);
      console.log("📊 Result:", result.success ? "Success" : "Failed");
      console.log("💬 Message:", result.message.substring(0, 100) + "...");
    } catch (error) {
      console.log("❌ Error:", error.message);
    }

    console.log("\n✅ Blog Data System test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

module.exports = { testBlogDataSystem };

// Run if called directly
if (require.main === module) {
  testBlogDataSystem()
    .then(() => {
      console.log("\n🎉 Test script completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Test script failed:", error);
      process.exit(1);
    });
}
