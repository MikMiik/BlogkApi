"use strict";
const generateTopics = require("./helpers/generateTopics");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log("Đang tạo dữ liệu topics...");
      const topics = await generateTopics();
      console.log("Đã tạo xong dữ liệu topics!");
      await queryInterface.bulkInsert("topics", topics, {});
      console.log("Đã thêm dữ liệu topics vào bảng");
    } catch (error) {
      console.error("Lỗi khi tạo topics:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("topics", null, {});
    await queryInterface.sequelize.query(
      "ALTER TABLE topics AUTO_INCREMENT = 1"
    );
  },
};
