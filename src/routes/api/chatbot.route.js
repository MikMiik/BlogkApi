const express = require("express");
const router = express.Router();
const chatController = require("@/controllers/api/chatbot.controller");

// Main chat functionality
router.post("/", chatController.send);

// Training and feedback
router.post("/train", chatController.trainFromFeedback);
router.post("/training/example", chatController.addTrainingExample);

// Basic stats (only working endpoints)
router.get("/stats", chatController.getStats);

// Session management
router.post("/sessions", chatController.createSession);
router.get("/sessions/user", chatController.getUserSessions);
router.get("/sessions/:sessionId/stats", chatController.getSessionStats);
router.delete("/sessions/:sessionId", chatController.clearSession);
router.delete("/sessions/user/all", chatController.clearUserSessions);

// History management
router.get("/history/:sessionId", chatController.getConversationHistory);

module.exports = router;
