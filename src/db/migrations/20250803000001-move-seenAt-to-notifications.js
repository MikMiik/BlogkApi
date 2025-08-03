"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Thêm trường seenAt vào bảng notifications
    await queryInterface.addColumn("notifications", "seenAt", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "link",
    });
    await queryInterface.addColumn("notifications", "deletedAt", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "updatedAt",
    });

    await queryInterface.removeColumn("notification_user", "seenAt");
  },

  async down(queryInterface, Sequelize) {
    // Thêm lại trường seenAt vào bảng notification_user
    await queryInterface.addColumn("notification_user", "seenAt", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "notificationId",
    });

    // Xóa trường seenAt từ bảng notifications
    await queryInterface.removeColumn("notifications", "seenAt");
    await queryInterface.removeColumn("notifications", "deletedAt");
  },
};
