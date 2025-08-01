"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "socials", {
      type: Sequelize.TEXT,
      after: "role",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "socials");
  },
};
