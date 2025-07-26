"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("conversations", "deletedAt", {
      type: Sequelize.DATE,
      after: "lastMessageAt",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("conversations", "deletedAt");
  },
};
