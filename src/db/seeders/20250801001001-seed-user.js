"use strict";
const generateUsers = require("./helpers/generateUsers");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log("Đang tạo dữ liệu users...");
      const users = await generateUsers(100);
      console.log("Đã tạo xong dữ liệu users!");
      await queryInterface.bulkInsert("users", users, {});
      console.log("Đã thêm dữ liệu users vào bảng");
    } catch (error) {
      console.error("Lỗi khi tạo users:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
    await queryInterface.sequelize.query(
      "ALTER TABLE users AUTO_INCREMENT = 1"
    );
  },
};
