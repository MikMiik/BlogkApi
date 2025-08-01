"use strict";

const { faker } = require("@faker-js/faker");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const notifications = await queryInterface.sequelize.query(
      `SELECT id FROM notifications;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const userIds = users.map((user) => user.id);
    const notificationIds = notifications.map((notif) => notif.id);
    const notificationUsers = [];

    // Tạo notification_user relationships
    for (const notificationId of notificationIds) {
      // Mỗi notification sẽ được gửi cho 1-5 users ngẫu nhiên
      const recipientCount = faker.number.int({ min: 1, max: 5 });
      const recipients = faker.helpers.arrayElements(userIds, recipientCount);

      for (const userId of recipients) {
        const hasSeenNotification = faker.datatype.boolean({
          probability: 0.6,
        });

        notificationUsers.push({
          userId,
          notificationId,
          seenAt: hasSeenNotification ? faker.date.recent() : null,
          createdAt: faker.date.between({
            from: "2022-01-01T00:00:00.000Z",
            to: "2025-06-14T00:00:00.000Z",
          }),
          updatedAt: faker.date.recent(),
        });
      }
    }

    try {
      console.log("Đang tạo dữ liệu notification users...");
      await queryInterface.bulkInsert(
        "notification_user",
        notificationUsers,
        {}
      );
      console.log("Đã thêm dữ liệu notification users vào bảng");
    } catch (error) {
      console.error("Lỗi khi tạo notification users:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("notification_user", null, {});
    await queryInterface.sequelize.query(
      "ALTER TABLE notification_user AUTO_INCREMENT = 1"
    );
  },
};
