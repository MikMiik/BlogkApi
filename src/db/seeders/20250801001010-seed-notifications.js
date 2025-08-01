"use strict";

const generateNotifications = require("./helpers/generateNotifications");

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
      console.log("Đang tạo dữ liệu notifications...");
      const notifications = await generateNotifications(200, {
        userIds,
        postIds,
        commentIds,
      });
      console.log("Đã tạo xong dữ liệu notifications!");
      await queryInterface.bulkInsert("notifications", notifications, {});
      console.log("Đã thêm dữ liệu notifications vào bảng");
    } catch (error) {
      console.error("Lỗi khi tạo notifications:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("notifications", null, {});
    await queryInterface.sequelize.query(
      "ALTER TABLE notifications AUTO_INCREMENT = 1"
    );
  },
};
