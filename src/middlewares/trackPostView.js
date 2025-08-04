const redisClient = require("@/configs/redis");
const cookieManager = require("@/configs/cookie");
const getCurrentUser = require("@/utils/getCurrentUser");

/**
 * Middleware to track post views using Redis and Cookies
 * Only counts views for authenticated users
 */
const trackPostView = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = getCurrentUser();

    // Chỉ track view cho user đã đăng nhập
    if (!userId) {
      return next();
    }

    // 1. Check cookie first (fast check)
    const hasViewedInCookie = cookieManager.hasViewedPost(req, postId);

    // 2. Create Redis key with userId
    const viewKey = `user:${userId}:viewed:${postId}`;

    // 3. Check Redis for more accurate tracking
    const hasViewedInRedis = await redisClient.exists(viewKey);

    // 4. If not viewed, increment view count
    if (!hasViewedInRedis) {
      console.log(`📊 New view tracked: User ${userId} viewed post ${postId}`);

      // Set Redis flag with 24h TTL (86400 seconds)
      await redisClient.set(viewKey, "viewed", 86400);

      // Increment view count in Redis
      const viewCountKey = `post:${postId}:views`;
      await redisClient.incr(viewCountKey);

      // Update cookie (client-side tracking)
      cookieManager.addViewedPost(res, req, postId);

      // Async database update (don't block response)
      setImmediate(async () => {
        try {
          const { Post } = require("@/models");
          await Post.increment("viewsCount", {
            where: { id: postId },
            silent: true, // Don't trigger hooks
          });
          console.log(`🔄 Database view count updated for post ${postId}`);
        } catch (error) {
          console.error(
            "❌ Error updating view count in database:",
            error.message
          );
        }
      });

      // Add flag to request for controller
      req.isNewView = true;
    } else {
      req.isNewView = false;
      console.log(`👀 User ${userId} already viewed post ${postId}`);
    }

    next();
  } catch (error) {
    console.error("❌ Error in trackPostView middleware:", error.message);
    // Don't block the request if view tracking fails
    next();
  }
};

module.exports = trackPostView;
