const express = require("express");
const router = express.Router();
const messageController = require("@/controllers/api/message.controller");

router.get("/", messageController.getAllConversations);
router.get("/:id", messageController.getConversation);
router.post("/send", messageController.send);

module.exports = router;
