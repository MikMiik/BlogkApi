const express = require("express");
const router = express.Router();

const postController = require("@/controllers/api/post.controller");
const handleUpload = require("@/middlewares/handleUpload");
const postValidator = require("@/validators/post.validator");
const ensureAsyncContext = require("@/utils/asyncHooks");

// Search posts - đặt lên trên trước các route có :id
router.get("/search", postController.searchPosts);

router.get("/", postController.getList);
router.get("/bookmarks", postController.getBookmarkList);
router.get("/my-posts", postController.getOwnList);
router.post("/draft", postValidator.write, postController.draft);
router.get("/write/:id", postController.getToEdit);
router.put(
  "/write/:id",
  ensureAsyncContext(handleUpload.single("coverImage")),
  postController.edit
);
router.patch(
  "/write/:id",
  ensureAsyncContext(handleUpload.single("coverImage")),
  postController.edit
);
router.post(
  "/publish",
  ensureAsyncContext(handleUpload.single("coverImage")),
  postValidator.write,
  postController.publish
);
router.post("/:id/like", postController.likeOne);
router.delete("/:id/unlike", postController.unlikeOne);
router.post("/:id/bookmark", postController.bookmarkOne);
router.delete("/:id/unbookmark", postController.unBookmarkOne);
router.delete("/clear-bookmarks", postController.clearBookmarks);
router.get("/:id", postController.getOne);
router.delete("/:id", postController.remove);

module.exports = router;
