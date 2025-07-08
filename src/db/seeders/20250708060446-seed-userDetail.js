"use strict";
const { faker } = require("@faker-js/faker");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const userDetails = [];
    try {
      console.log("Đang tạo dữ liệu userDetails...");
      for (const user of users) {
        const detail = {
          userId: user.id,
          birthday: faker.date.birthdate({ min: 18, max: 80, mode: "age" }),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
          gender: faker.helpers.arrayElement(["Male", "Female", "Other"]),
          address: faker.location.streetAddress(true),
          introduction: faker.lorem.sentence(),
          // blockedAt: faker.datatype.boolean(0.1) ? faker.date.recent() : null, // 10% chance bị block
          createdAt: faker.date.between({
            from: "2022-01-01T00:00:00.000Z",
            to: "2025-06-14T00:00:00.000Z",
          }),
          updatedAt: faker.date.recent(),
        };

        userDetails.push(detail);
      }
      console.log("Đã tạo xong dữ liệu userDetails!");
      await queryInterface.bulkInsert("userDetails", userDetails, {});
      console.log("Đã thêm dữ liệu users vào bảng");
    } catch (error) {
      console.error("Lỗi khi tạo userDetails:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("userDetails", null, {});
    await queryInterface.sequelize.query(
      "ALTER TABLE userDetails AUTO_INCREMENT = 1"
    );
  },
};
