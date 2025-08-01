"use strict";

const generateConversations = require("./helpers/generateConversations");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const userIds = users.map((user) => user.id);

    try {
      console.log("Đang tạo dữ liệu conversations...");
      const conversations = await generateConversations(50, { userIds });
      console.log("Đã tạo xong dữ liệu conversations!");
      await queryInterface.bulkInsert("conversations", conversations, {});
      console.log("Đã thêm dữ liệu conversations vào bảng");
    } catch (error) {
      console.error("Lỗi khi tạo conversations:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("conversations", null, {});
    await queryInterface.sequelize.query(
      "ALTER TABLE conversations AUTO_INCREMENT = 1"
    );
  },
};
