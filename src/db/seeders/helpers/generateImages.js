const { faker } = require("@faker-js/faker");

// Cấu hình faker cho tiếng Việt (tùy chọn)
faker.locale = "vi";

// Hàm tạo dữ liệu user giả
async function generateImages(count = 100, options = {}) {
  const images = [];

  for (let i = 0; i < count; i++) {
    const image = {
      postId: faker.helpers.arrayElement(options.postIds),
      url: `https://picsum.photos/seed/${i}/600/400`,
      altText: "postImage",
      createdAt: faker.date.between({
        from: "2022-01-01T00:00:00.000Z",
        to: "2025-06-14T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    };

    images.push(image);
  }
  return images;
}

module.exports = generateImages;
