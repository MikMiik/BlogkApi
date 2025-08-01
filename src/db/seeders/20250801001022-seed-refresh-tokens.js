"use strict";

const generateRefreshTokens = require("./helpers/generateRefreshTokens");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const userIds = users.map((user) => user.id);

    try {
      console.log("Đang tạo dữ liệu refresh tokens...");
      const refreshTokens = await generateRefreshTokens(50, { userIds });
      console.log("Đã tạo xong dữ liệu refresh tokens!");
      await queryInterface.bulkInsert("refresh-tokens", refreshTokens, {});
      console.log("Đã thêm dữ liệu refresh tokens vào bảng");
    } catch (error) {
      console.error("Lỗi khi tạo refresh tokens:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("refresh-tokens", null, {});
    await queryInterface.sequelize.query(
      "ALTER TABLE `refresh-tokens` AUTO_INCREMENT = 1"
    );
  },
};
