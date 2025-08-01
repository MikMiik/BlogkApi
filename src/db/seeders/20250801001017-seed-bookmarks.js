"use strict";

const generateBookmarks = require("./helpers/generateBookmarks");

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
      console.log("Đang tạo dữ liệu bookmarks...");
      const bookmarks = await generateBookmarks(200, {
        userIds,
        postIds,
      });
      console.log("Đã tạo xong dữ liệu bookmarks!");
      await queryInterface.bulkInsert("bookmarks", bookmarks, {});
      console.log("Đã thêm dữ liệu bookmarks vào bảng");
    } catch (error) {
      console.error("Lỗi khi tạo bookmarks:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("bookmarks", null, {});
    await queryInterface.sequelize.query(
      "ALTER TABLE bookmarks AUTO_INCREMENT = 1"
    );
  },
};
