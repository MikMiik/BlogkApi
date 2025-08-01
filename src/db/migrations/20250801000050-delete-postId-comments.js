"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("comments", "postId");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("comments", "postId", {
      type: Sequelize.TEXT,
      after: "content",
    });
  },
};
