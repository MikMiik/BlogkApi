const express = require("express");
const router = express.Router();

const postController = require("@/controllers/api/post.controller");
const attachResourceLoaders = require("@/utils/attachResourceLoaders");

attachResourceLoaders(router, ["post"]);
// Posts
router.get("/", postController.getList);
router.get("/:post", postController.getOne);
router.post("/:post/like", postController.likeOne);
router.delete("/:post/unlike", postController.unlikeOne);
// router.post("/", postsValidator.createPostValidator, postsController.create);
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
