const settingService = require("@/services/setting.service");

const checkCommentSettings = async (req, res, next) => {
  try {
    const { commentableId, commentableType } = req.body;

    if (commentableType === "Post") {
      // Get post to find author
      const { Post } = require("@/models");
      const post = await Post.findByPk(commentableId);

      if (!post) {
        return res.error(404, "Post not found");
      }

      const authorId = post.userId;

      // Check if author allows comments
      const allowComments = await settingService.shouldAllowComments(authorId);

      if (!allowComments) {
        return res.error(403, "Comments are disabled for this post");
      }
    }

    next();
  } catch (error) {
    console.error("Error checking comment settings:", error);
    res.error(500, "Error checking comment settings");
  }
};

module.exports = checkCommentSettings;
