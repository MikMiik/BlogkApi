"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("posts", "excerpt", {
      type: Sequelize.TEXT,
      after: "description",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("posts", "excerpt");
  },
};
