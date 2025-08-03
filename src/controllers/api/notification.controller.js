const notificationService = require("@/services/notification.service");

exports.markAsRead = async (req, res) => {
  const { notificationId } = req.params;
  await notificationService.markNotificationAsRead(notificationId);
  res.success(200);
};

exports.markAllAsRead = async (req, res) => {
  await notificationService.markAllNotificationsAsRead();
  res.success(200);
};
