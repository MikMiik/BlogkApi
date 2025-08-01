const { faker } = require("@faker-js/faker");

// Cấu hình faker cho tiếng Việt (tùy chọn)
faker.locale = "vi";

async function generateMessages(count = 1000, options = {}) {
  const messages = [];

  for (let i = 0; i < count; i++) {
    const type = faker.helpers.arrayElement(["text", "image", "file"]);
    let content;

    switch (type) {
      case "text":
        content = faker.lorem.sentences(faker.number.int({ min: 1, max: 3 }));
        break;
      case "image":
        content = `https://picsum.photos/seed/${i}/400/300`;
        break;
      case "file":
        content = `https://example.com/files/document_${i}.pdf`;
        break;
    }

    const message = {
      userId: faker.helpers.arrayElement(options.userIds),
      conversationId: faker.helpers.arrayElement(options.conversationIds),
      type,
      content,
      status: faker.helpers.arrayElement(["sent", "delivered", "read"]),
      createdAt: faker.date.between({
        from: "2022-01-01T00:00:00.000Z",
        to: "2025-06-14T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    };

    messages.push(message);
  }
  return messages;
}

module.exports = generateMessages;
