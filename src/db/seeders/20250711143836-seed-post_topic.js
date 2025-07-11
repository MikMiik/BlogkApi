"use strict";

const { faker } = require("@faker-js/faker");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Lấy tất cả id của bài viết
    const posts = await queryInterface.sequelize.query(
      `SELECT id FROM posts;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const postIds = posts.map((p) => p.id);

    // Lấy tất cả id của topic
    const topics = await queryInterface.sequelize.query(
      `SELECT id FROM topics;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const topicIds = topics.map((t) => t.id);

    const postTopics = [];

    for (const postId of postIds) {
      // Random số topic mỗi post
      const randomCount = faker.number.int({ min: 1, max: 3 });

      // Chọn ngẫu nhiên topic không trùng lặp
      const selectedTopics = faker.helpers.arrayElements(topicIds, randomCount);

      for (const topicId of selectedTopics) {
        postTopics.push({
          postId,
          topicId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    await queryInterface.bulkInsert("post_topic", postTopics, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("post_topic", null, {});
  },
};
