"use strict";

const { faker } = require("@faker-js/faker");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const conversations = await queryInterface.sequelize.query(
      `SELECT id, type FROM conversations;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const userIds = users.map((user) => user.id);
    const participants = [];

    for (const conversation of conversations) {
      if (conversation.type === "private") {
        // Private conversation: 2 users
        const selectedUsers = faker.helpers.arrayElements(userIds, 2);
        for (const userId of selectedUsers) {
          participants.push({
            conversationId: conversation.id,
            userId,
            role: "member",
            joinedAt: faker.date.between({
              from: "2022-01-01T00:00:00.000Z",
              to: "2025-06-14T00:00:00.000Z",
            }),
            unreadCount: faker.number.int({ min: 0, max: 5 }),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } else {
        // Group conversation: 3-8 users
        const memberCount = faker.number.int({ min: 3, max: 8 });
        const selectedUsers = faker.helpers.arrayElements(userIds, memberCount);
        for (let i = 0; i < selectedUsers.length; i++) {
          participants.push({
            conversationId: conversation.id,
            userId: selectedUsers[i],
            role: i === 0 ? "admin" : "member",
            joinedAt: faker.date.between({
              from: "2022-01-01T00:00:00.000Z",
              to: "2025-06-14T00:00:00.000Z",
            }),
            unreadCount: faker.number.int({ min: 0, max: 10 }),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
    }

    try {
      console.log("Đang tạo dữ liệu conversation participants...");
      await queryInterface.bulkInsert(
        "conversation_participants",
        participants,
        {}
      );
      console.log("Đã thêm dữ liệu conversation participants vào bảng");
    } catch (error) {
      console.error("Lỗi khi tạo conversation participants:", error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("conversation_participants", null, {});
  },
};
