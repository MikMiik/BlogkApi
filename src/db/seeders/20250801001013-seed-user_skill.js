"use strict";

const { faker } = require("@faker-js/faker");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Lấy tất cả id của bài viết
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const userIds = users.map((p) => p.id);

    // Lấy tất cả id của tag
    const skills = await queryInterface.sequelize.query(
      `SELECT id FROM skills;`,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    const skillIds = skills.map((t) => t.id);

    const userSkills = [];

    for (const userId of userIds) {
      // Random số skill mỗi user
      const randomCount = faker.number.int({ min: 1, max: 4 });

      // Chọn ngẫu nhiên skill không trùng lặp
      const selectedSkills = faker.helpers.arrayElements(skillIds, randomCount);

      for (const skillId of selectedSkills) {
        userSkills.push({
          userId,
          skillId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    await queryInterface.bulkInsert("user_skill", userSkills, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("user_skill", null, {});
  },
};
