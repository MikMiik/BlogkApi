"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "website", {
      type: Sequelize.STRING(255),
      after: "socials",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "website");
  },
};
