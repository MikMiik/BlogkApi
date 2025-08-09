const ViewCountManager = require("@/utils/viewCountManager");

/**
 * Job to sync Redis view counts to database
 * This job should be scheduled to run periodically via queue system
 */
async function viewCountSyncJob(job) {
  try {
    console.log("🔄 Starting view count sync job...");
    const startTime = Date.now();

    // Parse job data if any specific posts to sync
    const data = job.payload ? JSON.parse(job.payload) : {};
    const { postId, batchSize = 100 } = data;

    if (postId) {
      // Sync specific post
      await ViewCountManager.syncToDatabase(postId);
      console.log(`✅ Synced view count for post ${postId}`);
    } else {
      // For bulk sync, we would need to implement batch processing
      // Since current ViewCountManager doesn't support bulk sync,
      // this is a placeholder for future enhancement
      console.log("⚠️ Bulk sync not implemented yet in ViewCountManager");
      console.log("Use specific postId in job payload for individual sync");
    }

    const duration = Date.now() - startTime;
    console.log(`✅ View count sync job completed in ${duration}ms`);
  } catch (error) {
    console.error("❌ View count sync job failed:", error.message);
    throw error; // Re-throw to let queue system handle retry logic
  }
}

module.exports = viewCountSyncJob;
