"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("conversations", "creatorId", {
      type: Sequelize.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
      after: "name",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("conversations", "creatorId");
  },
};
