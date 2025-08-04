const redisClient = require("@/configs/redis");
const { Post } = require("@/models");

class ViewCountManager {
  /**
   * Get current view count for a post
   * @param {string} postId - Post ID
   * @returns {Promise<number>} View count
   */
  static async getViewCount(postId) {
    try {
      const redisKey = `post:${postId}:views`;
      const redisCount = await redisClient.get(redisKey);

      if (redisCount !== null) {
        return parseInt(redisCount);
      }

      // Fallback to database
      const post = await Post.findByPk(postId, {
        attributes: ["viewsCount"],
      });

      const dbCount = post?.viewsCount || 0;

      // Sync Redis with database count (with TTL)
      await redisClient.set(redisKey, dbCount.toString(), 86400);

      return dbCount;
    } catch (error) {
      console.error("❌ Error getting view count:", error.message);
      return 0;
    }
  }

  /**
   * Sync Redis view counts to database
   * @param {string} postId - Post ID (optional, if not provided, sync all)
   */
  static async syncToDatabase(postId = null) {
    try {
      if (postId) {
        // Sync specific post
        const redisKey = `post:${postId}:views`;
        const redisCount = await redisClient.get(redisKey);

        if (redisCount !== null) {
          await Post.update(
            { viewsCount: parseInt(redisCount) },
            { where: { id: postId }, silent: true }
          );
          console.log(`✅ Synced view count for post ${postId}: ${redisCount}`);
        }
      } else {
        // Sync all posts (use deletePattern to get all view keys)
        console.log("⚠️ Bulk sync not available with current Redis setup");
        console.log("Use syncToDatabase(postId) for individual posts");
      }
    } catch (error) {
      console.error("❌ Error syncing view counts:", error.message);
    }
  }

  /**
   * Reset view tracking for a user
   * @param {string} userId - User ID
   */
  static async resetUserViews(userId) {
    try {
      // Use deletePattern to remove all user viewed keys
      const pattern = `user:${userId}:viewed:*`;
      const success = await redisClient.deletePattern(pattern);

      if (success) {
        console.log(`🔄 Reset view records for user ${userId}`);
      } else {
        console.log(`⚠️ No view records found for user ${userId}`);
      }
    } catch (error) {
      console.error("❌ Error resetting user views:", error.message);
    }
  }

  /**
   * Get user's viewed posts (simplified version)
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array with limited info due to Redis constraints
   */
  static async getUserViewedPosts(userId) {
    try {
      console.log(
        "⚠️ getUserViewedPosts: Limited functionality with current Redis setup"
      );
      console.log("Consider using cookie-based tracking for user view history");
      return [];
    } catch (error) {
      console.error("❌ Error getting user viewed posts:", error.message);
      return [];
    }
  }

  /**
   * Get popular posts by view count (simplified version)
   * @param {number} limit - Number of posts to return
   * @returns {Promise<Array>} Array of posts from database
   */
  static async getPopularPosts(limit = 10) {
    try {
      // Fallback to database query for popular posts
      const posts = await Post.findAll({
        order: [["viewsCount", "DESC"]],
        limit,
        attributes: ["id", "title", "viewsCount"],
      });

      return posts.map((post) => ({
        postId: post.id,
        title: post.title,
        views: post.viewsCount,
      }));
    } catch (error) {
      console.error("❌ Error getting popular posts:", error.message);
      return [];
    }
  }
}

module.exports = ViewCountManager;
