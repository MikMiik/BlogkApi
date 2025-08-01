"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add unique constraint for conversationId and userId combination
    await queryInterface.addConstraint("conversation_participants", {
      fields: ["conversationId", "userId"],
      type: "unique",
      name: "unique_conversation_user",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the unique constraint
    await queryInterface.removeConstraint(
      "conversation_participants",
      "unique_conversation_user"
    );
  },
};
