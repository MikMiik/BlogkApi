const trainingService = require("../services/trainingService");

async function trainBlogDataAgent() {
  console.log("🚀 Starting BlogDataAgent training...");

  const trainingData = [
    // Tìm tác giả theo tiêu đề
    {
      message: "tác giả của bài viết Conspergo admiratio decor là ai",
      agent: "blogDataAgent",
      confidence: 1.0,
    },
    {
      message: "ai viết bài Conspergo admiratio decor",
      agent: "blogDataAgent",
      confidence: 1.0,
    },
    {
      message: "người viết bài có tiêu đề 'Thế giới công nghệ'",
      agent: "blogDataAgent",
      confidence: 1.0,
    },
    {
      message: "author của post Programming Tips",
      agent: "blogDataAgent",
      confidence: 1.0,
    },

    // Tìm bài viết theo tác giả
    {
      message: "bài viết của tác giả John Doe",
      agent: "blogDataAgent",
      confidence: 1.0,
    },
    {
      message: "các post của admin",
      agent: "blogDataAgent",
      confidence: 1.0,
    },
    {
      message: "article của người dùng mikmiin",
      agent: "blogDataAgent",
      confidence: 1.0,
    },

    // Bài viết mới nhất
    {
      message: "bài viết mới nhất",
      agent: "blogDataAgent",
      confidence: 1.0,
    },
    {
      message: "post recent nhất",
      agent: "blogDataAgent",
      confidence: 1.0,
    },
    {
      message: "5 bài mới nhất",
      agent: "blogDataAgent",
      confidence: 1.0,
    },
    {
      message: "latest articles",
      agent: "blogDataAgent",
      confidence: 1.0,
    },

    // Tìm kiếm chung
    {
      message: "tìm bài viết về javascript",
      agent: "blogDataAgent",
      confidence: 1.0,
    },
    {
      message: "search post about react",
      agent: "blogDataAgent",
      confidence: 1.0,
    },
    {
      message: "có bài nào về programming không",
      agent: "blogDataAgent",
      confidence: 1.0,
    },

    // Chi tiết bài viết
    {
      message: "chi tiết bài viết 'React Hooks Guide'",
      agent: "blogDataAgent",
      confidence: 1.0,
    },
    {
      message: "thông tin về post JavaScript Tips",
      agent: "blogDataAgent",
      confidence: 1.0,
    },

    // Danh mục
    {
      message: "bài viết trong danh mục Technology",
      agent: "blogDataAgent",
      confidence: 1.0,
    },
    {
      message: "post category Programming",
      agent: "blogDataAgent",
      confidence: 1.0,
    },
    {
      message: "chủ đề web development",
      agent: "blogDataAgent",
      confidence: 1.0,
    },

    // Thống kê blog
    {
      message: "thống kê blog",
      agent: "blogDataAgent",
      confidence: 1.0,
    },
    {
      message: "có bao nhiêu bài viết",
      agent: "blogDataAgent",
      confidence: 1.0,
    },
    {
      message: "tổng số tác giả",
      agent: "blogDataAgent",
      confidence: 1.0,
    },
    {
      message: "blog stats",
      agent: "blogDataAgent",
      confidence: 1.0,
    },

    // Các câu hỏi chung về nội dung
    {
      message: "blog này có gì",
      agent: "blogDataAgent",
      confidence: 0.8,
    },
    {
      message: "nội dung website",
      agent: "blogDataAgent",
      confidence: 0.8,
    },
    {
      message: "có những bài viết gì",
      agent: "blogDataAgent",
      confidence: 0.9,
    },
  ];

  let successCount = 0;
  let failCount = 0;

  for (const data of trainingData) {
    try {
      await trainingService.addTrainingExample(
        data.message,
        data.agent,
        data.confidence,
        "initial_training"
      );
      console.log(`✅ Added: "${data.message}"`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to add: "${data.message}"`, error.message);
      failCount++;
    }
  }

  console.log(`\n📊 Training completed:`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📈 Total: ${trainingData.length}`);

  // Train the intent
  try {
    console.log("\n🎯 Training BlogDataAgent intent...");
    await trainingService.trainIntent("blogDataAgent");
    console.log("✅ BlogDataAgent trained successfully!");
  } catch (error) {
    console.error("❌ Failed to train BlogDataAgent:", error.message);
  }
}

module.exports = { trainBlogDataAgent };

// Run if called directly
if (require.main === module) {
  trainBlogDataAgent()
    .then(() => {
      console.log("\n🎉 Training script completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Training script failed:", error);
      process.exit(1);
    });
}
