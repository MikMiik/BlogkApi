"use strict";

const generatePrivacySettings = require("./helpers/generatePrivacySettings");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const userIds = users.map((user) => user.id);

    try {
      console.log("Đang tạo dữ liệu privacy settings...");
      const privacySettings = await generatePrivacySettings({ userIds });
      console.log("Đã tạo xong dữ liệu privacy settings!");
      await queryInterface.bulkInsert(
        "user-privacy-settings",
        privacySettings,
        {}
      );
      console.log("Đã thêm dữ liệu privacy settings vào bảng");
    } catch (error) {
      console.error("Lỗi khi tạo privacy settings:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("user-privacy-settings", null, {});
    await queryInterface.sequelize.query(
      "ALTER TABLE `user-privacy-settings` AUTO_INCREMENT = 1"
    );
  },
};
