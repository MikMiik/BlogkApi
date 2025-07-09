"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("posts", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      topic: Sequelize.STRING(100),
      title: Sequelize.STRING(255),
      description: Sequelize.TEXT,
      slug: {
        type: Sequelize.STRING(191),
        unique: true,
      },
      content: Sequelize.TEXT,
      readTime: Sequelize.INTEGER,
      thumbnail: Sequelize.STRING(255),
      status: {
        type: Sequelize.STRING(50),
        defaultValue: "Draft",
      },
      metaTitle: Sequelize.STRING(255),
      metaDescription: Sequelize.TEXT,
      visibility: {
        type: Sequelize.STRING(50),
        defaultValue: "Public",
      },
      visibilityIcon: Sequelize.STRING(255),
      allowComments: Sequelize.BOOLEAN,
      viewsCount: Sequelize.INTEGER,
      likesCount: Sequelize.INTEGER,
      publishedAt: Sequelize.DATE,
      draftedAt: Sequelize.DATE,
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
    await queryInterface.dropTable("posts");
  },
};
