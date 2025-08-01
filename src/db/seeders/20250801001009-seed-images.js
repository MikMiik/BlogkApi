"use strict";

const generateImages = require("./helpers/generateImages");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const posts = await queryInterface.sequelize.query(
      `SELECT id FROM posts;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const postIds = posts.map((post) => post.id);
    try {
      console.log("Đang tạo dữ liệu images...");
      const images = await generateImages(2000, { postIds });
      console.log("Đã tạo xong dữ liệu images!");
      await queryInterface.bulkInsert("images", images, {});
      console.log("Đã thêm dữ liệu images vào bảng");
    } catch (error) {
      console.error("Lỗi khi tạo images:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("images", null, {});
    await queryInterface.sequelize.query(
      "ALTER TABLE images AUTO_INCREMENT = 1"
    );
  },
};
