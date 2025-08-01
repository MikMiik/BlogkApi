"use strict";
const generateSkills = require("./helpers/generateSkills");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log("Đang tạo dữ liệu skills...");
      const skills = await generateSkills();
      console.log("Đã tạo xong dữ liệu skills!");
      await queryInterface.bulkInsert("skills", skills, {});
      console.log("Đã thêm dữ liệu skills vào bảng");
    } catch (error) {
      console.error("Lỗi khi tạo skills:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("skills", null, {});
    await queryInterface.sequelize.query(
      "ALTER TABLE skills AUTO_INCREMENT = 1"
    );
  },
};
