const express = require("express");
const router = express.Router();

const commentController = require("@/controllers/api/comment.controller");
const attachResourceLoaders = require("@/utils/attachResourceLoaders");

attachResourceLoaders(router, ["comment"]);
// Comments
router.get("/", commentController.getList);
router.post("/:comment/like", commentController.likeOne);
router.delete("/:comment/unlike", commentController.unlikeOne);
router.get("/:comment", commentController.getOne);
router.post("/", commentController.create);
router.put("/:comment", commentController.update);
router.patch("/:comment", commentController.update);
router.delete("/:comment", commentController.remove);

module.exports = router;
