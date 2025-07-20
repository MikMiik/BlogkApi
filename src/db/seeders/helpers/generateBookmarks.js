const { faker } = require("@faker-js/faker");

// Cấu hình faker cho tiếng Việt (tùy chọn)
faker.locale = "vi";

// Hàm tạo dữ liệu user giả
async function generateBookmarks(count = 100, options = {}) {
  const bookmarks = [];

  for (let i = 0; i < count; i++) {
    const bookmark = {
      userId: faker.helpers.arrayElement(options.userIds),
      postId: faker.helpers.arrayElement(options.postIds),
      createdAt: faker.date.between({
        from: "2022-01-01T00:00:00.000Z",
        to: "2025-06-14T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    };

    bookmarks.push(bookmark);
  }
  return bookmarks;
}

module.exports = generateBookmarks;
