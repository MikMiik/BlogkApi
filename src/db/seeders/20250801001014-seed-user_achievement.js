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
    const achievements = await queryInterface.sequelize.query(
      `SELECT id FROM achievements;`,
      {
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    const achievementIds = achievements.map((t) => t.id);

    const userAchievements = [];

    for (const userId of userIds) {
      // Random số achievement mỗi user
      const randomCount = faker.number.int({ min: 1, max: 4 });

      // Chọn ngẫu nhiên achievement không trùng lặp
      const selectedAchievements = faker.helpers.arrayElements(
        achievementIds,
        randomCount
      );

      for (const achievementId of selectedAchievements) {
        userAchievements.push({
          userId,
          achievementId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    await queryInterface.bulkInsert("achievement_user", userAchievements, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("achievement_user", null, {});
  },
};
