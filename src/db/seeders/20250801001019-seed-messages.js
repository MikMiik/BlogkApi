"use strict";

const generateMessages = require("./helpers/generateMessages");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const conversations = await queryInterface.sequelize.query(
      `SELECT id FROM conversations;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const userIds = users.map((user) => user.id);
    const conversationIds = conversations.map((conv) => conv.id);

    try {
      console.log("Đang tạo dữ liệu messages...");
      const messages = await generateMessages(1000, {
        userIds,
        conversationIds,
      });
      console.log("Đã tạo xong dữ liệu messages!");
      await queryInterface.bulkInsert("messages", messages, {});
      console.log("Đã thêm dữ liệu messages vào bảng");
    } catch (error) {
      console.error("Lỗi khi tạo messages:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("messages", null, {});
    await queryInterface.sequelize.query(
      "ALTER TABLE messages AUTO_INCREMENT = 1"
    );
  },
};
