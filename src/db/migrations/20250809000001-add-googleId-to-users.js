"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "googleId", {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
      after: "username",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "googleId");
  },
};
