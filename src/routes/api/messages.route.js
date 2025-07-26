const express = require("express");
const router = express.Router();
const messageController = require("@/controllers/api/message.controller");

router.get("/", messageController.getConversation);
router.post("/send", messageController.send);

module.exports = router;
