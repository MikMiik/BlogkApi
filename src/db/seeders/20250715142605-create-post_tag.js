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

    // Lấy tất cả id của tag
    const tags = await queryInterface.sequelize.query(`SELECT id FROM tags;`, {
      type: Sequelize.QueryTypes.SELECT,
    });
    const tagIds = tags.map((t) => t.id);

    const postTags = [];

    for (const postId of postIds) {
      // Random số tag mỗi post
      const randomCount = faker.number.int({ min: 1, max: 4 });

      // Chọn ngẫu nhiên tag không trùng lặp
      const selectedTags = faker.helpers.arrayElements(tagIds, randomCount);

      for (const tagId of selectedTags) {
        postTags.push({
          postId,
          tagId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    await queryInterface.bulkInsert("post_tag", postTags, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("post_tag", null, {});
  },
};
