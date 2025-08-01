const { faker } = require("@faker-js/faker");

// Cấu hình faker cho tiếng Việt (tùy chọn)
faker.locale = "vi";

async function generateConversations(count = 50, options = {}) {
  const conversations = [];

  for (let i = 0; i < count; i++) {
    const type = faker.helpers.arrayElement(["private", "group"]);
    const conversation = {
      name: type === "group" ? faker.company.name() : null,
      groupName: type === "group" ? faker.company.catchPhrase() : null,
      type,
      creatorId: faker.helpers.arrayElement(options.userIds),
      groupAvatar:
        type === "group"
          ? `https://api.dicebear.com/7.x/initials/svg?seed=${i}`
          : null,
      createdAt: faker.date.between({
        from: "2022-01-01T00:00:00.000Z",
        to: "2025-06-14T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    };

    conversations.push(conversation);
  }
  return conversations;
}

module.exports = generateConversations;
