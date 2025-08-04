const pusher = require("@/configs/pusher");
const { Notification_User, Notification, sequelize } = require("@/models");
const getCurrentUser = require("@/utils/getCurrentUser");
const generateNotificationLink = require("@/utils/generateNotificationLink");
const settingService = require("./setting.service");

class NotificationService {
  // Getter for current user ID
  get userId() {
    return getCurrentUser();
  }
  async getAllNotifications() {
    const userId = this.userId;
    if (!userId) {
      return null;
    }
    const notifications = await Notification_User.findAll({
      where: { userId },
      include: [
        {
          model: Notification,
          as: "notification",
          attributes: [
            "id",
            "notifiableType",
            "notifiableId",
            "content",
            "link",
            "seenAt",
            "createdAt",
          ],
        },
      ],
    });
    return notifications;
  }

  async createNotification({ data, userId, transaction }) {
    const canReceive = await settingService.canReceiveNotification(
      userId,
      data.type
    );
    if (!canReceive) {
      return { message: "Notification blocked by user settings" };
    }

    // Generate link automatically
    const link = await generateNotificationLink(
      data.type,
      data.notifiableType,
      data.notifiableId
    );

    // Add link to notification data
    const notificationData = {
      ...data,
      link,
    };

    let notification;

    if (transaction) {
      // Use existing transaction
      const res = await Notification.create(notificationData, {
        transaction,
      });

      await Notification_User.create(
        {
          userId,
          notificationId: res.id,
        },
        { transaction }
      );

      notification = res;
    } else {
      // Create new transaction only if none provided
      notification = await sequelize.transaction(async (t) => {
        const res = await Notification.create(notificationData, {
          transaction: t,
        });

        await Notification_User.create(
          {
            userId,
            notificationId: res.id,
          },
          { transaction: t }
        );

        return res;
      });
    }

    // Trigger real-time notification (outside transaction)
    try {
      await pusher.trigger(
        `notifications-${userId}`,
        "new-notification",
        notification
      );
    } catch (error) {
      console.error("Error triggering pusher notification:", error);
      // Don't throw - pusher failure shouldn't break notification creation
    }

    return notification;
  }

  async markNotificationAsRead(notificationId) {
    const userId = this.userId;
    if (!userId) {
      return null;
    }
    // Update the notification with correct Sequelize syntax
    const [affectedRows] = await Notification.update(
      { seenAt: new Date() },
      { where: { id: notificationId } }
    );
    if (affectedRows > 0) {
      return affectedRows;
    }

    return null;
  }

  async markAllNotificationsAsRead() {
    const userId = this.userId;
    if (!userId) {
      return null;
    }
    // Update all notifications for the user
    const notiIds = await Notification_User.findAll({
      where: { userId },
      attributes: ["notificationId"],
      raw: true,
    });
    const [affectedRows] = await Notification.update(
      { seenAt: new Date() },
      { where: { id: notiIds.map((n) => n.notificationId), seenAt: null } }
    );
    if (affectedRows > 0) {
      return affectedRows;
    }

    return null;
  }

  async deleteNotification(notificationId) {
    const userId = this.userId;

    // Kiểm tra quyền xóa
    const participant = await Notification_User.findOne({
      where: { notificationId, userId },
    });

    if (!participant) {
      throw new Error("You are not a participant of this notification");
    }

    await Notification.destroy({
      where: {
        id: notificationId,
      },
    });

    return true;
  }
}

module.exports = new NotificationService();
