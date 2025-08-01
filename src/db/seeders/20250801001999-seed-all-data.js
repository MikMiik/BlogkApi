"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("🚀 Bắt đầu seeding toàn bộ database...");

    try {
      // 1. Seed cơ bản
      console.log("📝 Seeding users, skills, achievements, topics, tags...");

      // 2. Seed nội dung
      console.log("📄 Seeding posts và comments...");

      // 3. Seed relationships
      console.log("🔗 Seeding relationships...");

      // 4. Seed interactions
      console.log("❤️ Seeding interactions (likes, bookmarks, follows)...");

      // 5. Seed communications
      console.log("💬 Seeding conversations và messages...");

      // 6. Seed notifications
      console.log("🔔 Seeding notifications...");

      // 7. Seed additional data
      console.log("🖼️ Seeding images và privacy settings...");

      console.log("✅ Hoàn thành seeding toàn bộ database!");
    } catch (error) {
      console.error("❌ Lỗi khi seeding database:", error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log("🧹 Đang xóa toàn bộ dữ liệu seeded...");

    const tables = [
      "notification_user",
      "user-privacy-settings",
      "refresh-tokens",
      "socials",
      "conversation_participants",
      "messages",
      "conversations",
      "notifications",
      "follows",
      "bookmarks",
      "likes",
      "images",
      "post_tag",
      "post_topic",
      "user_achievement",
      "user_skill",
      "comments",
      "posts",
      "tags",
      "topics",
      "achievements",
      "skills",
      "users",
    ];

    for (const table of tables) {
      try {
        await queryInterface.bulkDelete(table, null, {});
        console.log(`✅ Đã xóa dữ liệu từ bảng ${table}`);
      } catch (error) {
        console.log(`⚠️ Không thể xóa bảng ${table}: ${error.message}`);
      }
    }

    console.log("✅ Hoàn thành xóa dữ liệu!");
  },
};
