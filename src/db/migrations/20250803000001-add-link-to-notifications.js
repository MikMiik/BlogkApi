"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("notifications", "link", {
      type: Sequelize.STRING(255),
      after: "content",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("notifications", "link");
  },
};
