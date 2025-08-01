"use strict";
const generateAchievements = require("./helpers/generateAchievements");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log("Đang tạo dữ liệu achievements...");
      const achievements = await generateAchievements();
      console.log("Đã tạo xong dữ liệu achievements!");
      await queryInterface.bulkInsert("achievements", achievements, {});
      console.log("Đã thêm dữ liệu achievements vào bảng");
    } catch (error) {
      console.error("Lỗi khi tạo achievements:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("achievements", null, {});
    await queryInterface.sequelize.query(
      "ALTER TABLE achievements AUTO_INCREMENT = 1"
    );
  },
};
