"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "avatar", {
      type: Sequelize.STRING(255),
      after: "username",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "avatar");
  },
};
