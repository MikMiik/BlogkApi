"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("userSettings", {
      userId: {
        type: Sequelize.INTEGER,
        unique: true,
        references: {
          model: "users",
          key: "id",
        },
      },

      data: Sequelize.JSON,

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("userSettings");
  },
};
