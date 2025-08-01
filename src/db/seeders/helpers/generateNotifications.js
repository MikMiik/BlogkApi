const { faker } = require("@faker-js/faker");

// Cấu hình faker cho tiếng Việt (tùy chọn)
faker.locale = "vi";

async function generateNotifications(count = 200, options = {}) {
  const notifications = [];

  for (let i = 0; i < count; i++) {
    const type = faker.helpers.arrayElement([
      "like",
      "comment",
      "follow",
      "mention",
      "post",
    ]);
    const notifiableType = faker.helpers.arrayElement([
      "Post",
      "Comment",
      "User",
    ]);
    let notifiableId;

    switch (notifiableType) {
      case "Post":
        notifiableId = faker.helpers.arrayElement(options.postIds);
        break;
      case "Comment":
        notifiableId = faker.helpers.arrayElement(options.commentIds);
        break;
      case "User":
        notifiableId = faker.helpers.arrayElement(options.userIds);
        break;
    }

    const notification = {
      type,
      notifiableType,
      notifiableId,
      content: `${type} notification for ${notifiableType.toLowerCase()}`,
      createdAt: faker.date.between({
        from: "2022-01-01T00:00:00.000Z",
        to: "2025-06-14T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    };

    notifications.push(notification);
  }
  return notifications;
}

module.exports = generateNotifications;
