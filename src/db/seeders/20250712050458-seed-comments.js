"use strict";

const generateComments = require("./helpers/generateComments");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const posts = await queryInterface.sequelize.query(
      `SELECT id FROM posts;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const userIds = users.map((user) => user.id);
    const postIds = posts.map((post) => post.id);
    try {
      console.log("Đang tạo dữ liệu comments...");
      const comments = await generateComments(2000, { userIds, postIds });
      console.log("Đã tạo xong dữ liệu comments!");
      await queryInterface.bulkInsert("comments", comments, {});
      console.log("Đã thêm dữ liệu comments vào bảng");
    } catch (error) {
      console.error("Lỗi khi tạo comments:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("comments", null, {});
    await queryInterface.sequelize.query(
      "ALTER TABLE comments AUTO_INCREMENT = 1"
    );
  },
};
