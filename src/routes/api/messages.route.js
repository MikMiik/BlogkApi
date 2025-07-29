const express = require("express");
const router = express.Router();
const messageController = require("@/controllers/api/message.controller");

router.post("/", messageController.send);
router.get("/", messageController.getConversationMessages);

module.exports = router;
