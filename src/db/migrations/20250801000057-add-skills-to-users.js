"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "skills", {
      type: Sequelize.JSON,
      defaultValue: [],
      after: "socials",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "skills");
  },
};
