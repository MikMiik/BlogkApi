"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("conversation_participants", "unreadCount", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      after: "joinedAt",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      "conversation_participants",
      "unreadCount"
    );
  },
};
