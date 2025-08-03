const express = require("express");
const router = express.Router();
const notificationController = require("@/controllers/api/notification.controller");

router.post("/:notificationId/mark-as-read", notificationController.markAsRead);
router.post("/mark-all-as-read", notificationController.markAllAsRead);
router.delete("/:notificationId", notificationController.deleteNotification);

module.exports = router;
