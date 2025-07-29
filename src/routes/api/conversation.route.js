const express = require("express");
const router = express.Router();
const conversationController = require("@/controllers/api/conversation.controller");

router.get("/", conversationController.getList);

module.exports = router;
