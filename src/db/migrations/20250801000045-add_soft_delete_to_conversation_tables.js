"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Thêm cột deletedAt cho conversation_participants nếu chưa có
    const participantsTableInfo = await queryInterface.describeTable(
      "conversation_participants"
    );
    if (!participantsTableInfo.deletedAt) {
      await queryInterface.addColumn("conversation_participants", "deletedAt", {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    // Thêm cột deletedAt cho conversations nếu chưa có
    const conversationsTableInfo =
      await queryInterface.describeTable("conversations");
    if (!conversationsTableInfo.deletedAt) {
      await queryInterface.addColumn("conversations", "deletedAt", {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }

    // Thêm cột deletedAt cho messages nếu chưa có
    const messagesTableInfo = await queryInterface.describeTable("messages");
    if (!messagesTableInfo.deletedAt) {
      await queryInterface.addColumn("messages", "deletedAt", {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("conversation_participants", "deletedAt");
    await queryInterface.removeColumn("conversations", "deletedAt");
    await queryInterface.removeColumn("messages", "deletedAt");
  },
};
