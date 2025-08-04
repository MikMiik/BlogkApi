const ViewCountManager = require("@/utils/viewCountManager");

/**
 * Job to sync Redis view counts to database
 * Recommended to run every hour or daily
 */
class ViewCountSyncJob {
  static async run() {
    try {
      console.log("🔄 Starting view count sync job...");
      const startTime = Date.now();

      await ViewCountManager.syncToDatabase();

      const duration = Date.now() - startTime;
      console.log(`✅ View count sync completed in ${duration}ms`);
    } catch (error) {
      console.error("❌ View count sync job failed:", error.message);
    }
  }

  static startSchedule() {
    // Run every hour
    setInterval(
      () => {
        this.run();
      },
      60 * 60 * 1000
    );

    console.log("📅 View count sync job scheduled to run every hour");
  }
}

module.exports = ViewCountSyncJob;
