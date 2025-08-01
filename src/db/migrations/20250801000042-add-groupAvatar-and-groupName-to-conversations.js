"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("conversations", "groupAvatar", {
      type: Sequelize.STRING(255),
    });
    await queryInterface.addColumn("conversations", "groupName", {
      type: Sequelize.STRING(50),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("conversations", "groupAvatar");
    await queryInterface.removeColumn("conversations", "groupName");
  },
};
