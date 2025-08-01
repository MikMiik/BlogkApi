"use strict";

const generateTags = require("./helpers/generateTags");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log("Đang tạo dữ liệu tags...");
      const tags = await generateTags();
      console.log("Đã tạo xong dữ liệu tags!");
      await queryInterface.bulkInsert("tags", tags, {});
      console.log("Đã thêm dữ liệu tags vào bảng");
    } catch (error) {
      console.error("Lỗi khi tạo tags:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("tags", null, {});
    await queryInterface.sequelize.query("ALTER TABLE tags AUTO_INCREMENT = 1");
  },
};
