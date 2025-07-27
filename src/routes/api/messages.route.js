const express = require("express");
const router = express.Router();
const messageController = require("@/controllers/api/message.controller");

router.get("/", messageController.getAllConversations);
router.post("/", messageController.send);
router.get("/:id", messageController.getConversation);

module.exports = router;
