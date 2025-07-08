"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("userDetails", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED,
      },
      userId: {
        type: Sequelize.INTEGER.UNSIGNED,
        unique: true,
      },
      avatar: {
        type: Sequelize.STRING(191),
      },
      introduction: {
        type: Sequelize.TEXT,
      },

      gender: Sequelize.ENUM("Male", "Female", "Other"),

      birthday: Sequelize.DATE,

      address: Sequelize.STRING(191),

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("userDetails");
  },
};
