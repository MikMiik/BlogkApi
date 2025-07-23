"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("posts", "description");
    await queryInterface.removeColumn("posts", "visibilityIcon");
    await queryInterface.changeColumn("posts", "allowComments", {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    });
    await queryInterface.changeColumn("posts", "viewsCount", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
    await queryInterface.changeColumn("posts", "likesCount", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("posts", "description");
    await queryInterface.addColumn("posts", "visibilityIcon");
  },
};
