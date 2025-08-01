"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("conversation_participants", "isDeleted", {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      after: "unreadCount",
    });
    await queryInterface.addColumn(
      "conversation_participants",
      "historyCutoff",
      {
        type: Sequelize.DATE,
        after: "deletedAt",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("conversation_participants", "isDeleted");
    await queryInterface.removeColumn(
      "conversation_participants",
      "historyCutoff"
    );
  },
};
