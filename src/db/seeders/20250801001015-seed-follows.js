"use strict";

const generateFollows = require("./helpers/generateFollows");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const userIds = users.map((user) => user.id);

    try {
      console.log("Đang tạo dữ liệu follows...");
      const follows = await generateFollows(300, { userIds });
      console.log("Đã tạo xong dữ liệu follows!");
      await queryInterface.bulkInsert("follows", follows, {});
      console.log("Đã thêm dữ liệu follows vào bảng");
    } catch (error) {
      console.error("Lỗi khi tạo follows:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("follows", null, {});
    await queryInterface.sequelize.query(
      "ALTER TABLE follows AUTO_INCREMENT = 1"
    );
  },
};
