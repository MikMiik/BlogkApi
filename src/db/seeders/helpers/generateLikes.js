const { faker } = require("@faker-js/faker");

// Cấu hình faker cho tiếng Việt (tùy chọn)
faker.locale = "vi";

// Hàm tạo dữ liệu user giả
async function generateLikes(count = 100, options = {}) {
  const likes = [];

  for (let i = 0; i < count; i++) {
    const likableType = faker.helpers.arrayElement(["Post", "Comment"]);
    let likableId;
    if (likableType == "Post") {
      likableId = faker.helpers.arrayElement(options.postIds);
    } else {
      likableId = faker.helpers.arrayElement(options.commentIds);
    }
    const like = {
      userId: faker.helpers.arrayElement(options.userIds),
      likableId,
      likableType,
      createdAt: faker.date.between({
        from: "2022-01-01T00:00:00.000Z",
        to: "2025-06-14T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    };

    likes.push(like);
  }
  return likes;
}

module.exports = generateLikes;
