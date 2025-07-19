"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "coverImage", {
      type: Sequelize.STRING(255),
      after: "avatar",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "coverImage");
  },
};
