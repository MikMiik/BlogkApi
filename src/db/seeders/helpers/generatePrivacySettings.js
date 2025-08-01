const { faker } = require("@faker-js/faker");

// Cấu hình faker cho tiếng Việt (tùy chọn)
faker.locale = "vi";

async function generatePrivacySettings(options = {}) {
  const privacySettings = [];

  // Tạo privacy settings cho tất cả users
  for (const userId of options.userIds) {
    const privacySetting = {
      userId,
      profileVisibility: faker.helpers.arrayElement([
        "public",
        "private",
        "friends",
      ]),
      showEmail: faker.datatype.boolean(),
      showFollowersCount: faker.datatype.boolean(),
      showFollowingCount: faker.datatype.boolean(),
      allowDirectMessages: faker.datatype.boolean(),
      showOnlineStatus: faker.datatype.boolean(),
      createdAt: faker.date.between({
        from: "2022-01-01T00:00:00.000Z",
        to: "2025-06-14T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    };

    privacySettings.push(privacySetting);
  }
  return privacySettings;
}

module.exports = generatePrivacySettings;
