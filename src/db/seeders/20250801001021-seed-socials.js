"use strict";

const generateSocials = require("./helpers/generateSocials");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const userIds = users.map((user) => user.id);

    try {
      console.log("Đang tạo dữ liệu socials...");
      const socials = await generateSocials(100, { userIds });
      console.log("Đã tạo xong dữ liệu socials!");
      await queryInterface.bulkInsert("socials", socials, {});
      console.log("Đã thêm dữ liệu socials vào bảng");
    } catch (error) {
      console.error("Lỗi khi tạo socials:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("socials", null, {});
    await queryInterface.sequelize.query(
      "ALTER TABLE socials AUTO_INCREMENT = 1"
    );
  },
};
