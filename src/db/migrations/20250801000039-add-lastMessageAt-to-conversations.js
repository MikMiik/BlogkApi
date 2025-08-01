"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("conversations", "lastMessageAt", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "type",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("conversations", "lastMessageAt");
  },
};
