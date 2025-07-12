const { faker } = require("@faker-js/faker");

// Cấu hình faker cho tiếng Việt (tùy chọn)
faker.locale = "vi";

// Hàm tạo dữ liệu user giả
async function generateComments(count = 100, options = {}) {
  const comments = [];

  for (let i = 0; i < count; i++) {
    const comment = {
      userId: faker.helpers.arrayElement(options.userIds),
      parentId: null,
      content: faker.lorem.paragraphs(3),
      commentableId: faker.helpers.arrayElement(options.postIds),
      commentableType: "Post",
      deletedAt: null,
      createdAt: faker.date.between({
        from: "2022-01-01T00:00:00.000Z",
        to: "2025-06-14T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    };

    comments.push(comment);
  }
  return comments;
}

module.exports = generateComments;
