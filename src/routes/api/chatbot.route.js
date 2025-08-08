const express = require("express");
const router = express.Router();
const chatController = require("@/controllers/api/chatbot.controller");

// Main chat functionality
router.post("/", chatController.send);

// Training and feedback
router.post("/train", chatController.trainFromFeedback);
router.post("/training/example", chatController.addTrainingExample);
router.post("/training/retrain", chatController.retrainAllIntents);

// Analytics and stats
router.get("/stats", chatController.getStats);
router.get("/stats/classification", chatController.getClassificationStats);
router.get("/stats/performance", chatController.getMethodPerformance);
router.get("/stats/training", chatController.getTrainingStats);

// Data management
router.get("/export", chatController.exportTrainingData);
router.post("/history/clear", chatController.clearConversationHistory);
router.get("/history/:sessionId", chatController.getConversationHistory);
router.get("/sessions/user/:userId", chatController.getUserSessions);
router.get("/sessions/:sessionId/stats", chatController.getSessionStats);

module.exports = router;
