const express = require("express");
const router = express.Router();
const conversationController = require("@/controllers/api/conversation.controller");

router.get("/", conversationController.getList);
router.get("/:otherId", conversationController.getShared);
router.post("/:id/mark-read", conversationController.markRead);

module.exports = router;
