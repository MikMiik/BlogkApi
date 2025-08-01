"use strict";

const { faker } = require("@faker-js/faker");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Lấy tất cả id của users
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Cập nhật từng user với coverImage tương ứng
    for (const user of users) {
      const coverImage = `https://picsum.photos/seed/${user.id}/600/400`;

      await queryInterface.bulkUpdate(
        "users", // Tên bảng
        { coverImage }, // Giá trị cần cập nhật
        { id: user.id } // Điều kiện where
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // Gán null lại cho tất cả coverImage
    await queryInterface.bulkUpdate(
      "users",
      { coverImage: null },
      {} // Không có điều kiện: áp dụng cho tất cả
    );
  },
};
