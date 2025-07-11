"use strict";
const generatePosts = require("./helpers/generatePosts");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const userIds = users.map((user) => user.id);
    try {
      console.log("Đang tạo dữ liệu posts...");
      const posts = await generatePosts(600, { userIds });
      console.log("Đã tạo xong dữ liệu posts!");
      await queryInterface.bulkInsert("posts", posts, {});
      console.log("Đã thêm dữ liệu posts vào bảng");
    } catch (error) {
      console.error("Lỗi khi tạo posts:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("posts", null, {});
    await queryInterface.sequelize.query(
      "ALTER TABLE posts AUTO_INCREMENT = 1"
    );
  },
};
