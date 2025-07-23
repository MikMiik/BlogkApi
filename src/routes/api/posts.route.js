const express = require("express");
const router = express.Router();

const postController = require("@/controllers/api/post.controller");
const attachResourceLoaders = require("@/utils/attachResourceLoaders");
const handleUpload = require("@/middlewares/handleUpload");

attachResourceLoaders(router, ["post"]);
// Posts
router.get("/", postController.getList);
router.post("/", handleUpload.single("coverImage"), postController.create);
router.post("/:post/like", postController.likeOne);
router.delete("/:post/unlike", postController.unlikeOne);
router.post("/:post/bookmark", postController.bookmarkOne);
router.delete("/:post/unbookmark", postController.unBookmarkOne);
router.get("/:post", postController.getOne);
// router.put(
//   "/:post",
//   postsValidator.updatePostValidator,
//   postsController.update
// );
// router.patch(
//   "/:post",
//   postsValidator.updatePostValidator,
//   postsController.update
// );
// router.delete("/:post", postsController.remove);

// // Posts comments
// router.get("/:post/comments", postsController.getPostComments);
// router.post("/:post/comments", postsController.createPostComments);

module.exports = router;
