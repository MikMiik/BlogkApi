"use strict";

const generateLikes = require("./helpers/generateLikes");

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
    const comments = await queryInterface.sequelize.query(
      `SELECT id FROM comments;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const userIds = users.map((user) => user.id);
    const postIds = posts.map((post) => post.id);
    const commentIds = comments.map((comment) => comment.id);
    try {
      console.log("Đang tạo dữ liệu likes...");
      const likes = await generateLikes(2000, { userIds, postIds, commentIds });
      console.log("Đã tạo xong dữ liệu likes!");
      await queryInterface.bulkInsert("likes", likes, {});
      console.log("Đã thêm dữ liệu likes vào bảng");
    } catch (error) {
      console.error("Lỗi khi tạo likes:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("likes", null, {});
    await queryInterface.sequelize.query(
      "ALTER TABLE likes AUTO_INCREMENT = 1"
    );
  },
};
