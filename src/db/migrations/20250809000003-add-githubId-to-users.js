"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "githubId", {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
      after: "googleId",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "githubId");
  },
};
