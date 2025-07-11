const { faker } = require("@faker-js/faker");
const generateUniqueSlug = require("../../../utils/generateUniqueSlug");
const getExcerptFromContent = require("./getExcerptFromContent");

// Cấu hình faker cho tiếng Việt (tùy chọn)
faker.locale = "vi";

// Hàm tạo dữ liệu user giả
async function generatePosts(count = 100, options = {}) {
  const posts = [];
  const slugs = new Set();
  for (let i = 0; i < count; i++) {
    const title = faker.lorem.sentence(3);
    const content = faker.lorem.paragraphs(3);
    const post = {
      userId: faker.helpers.arrayElement(options.userIds),
      title,
      description: faker.lorem.sentence(3),
      slug: generateUniqueSlug(title, slugs),
      content,
      excerpt: getExcerptFromContent(content),
      readTime: faker.number.int({ min: 0, max: 10 }),
      thumbnail: `https://picsum.photos/seed/${i}/600/400`,
      status: faker.helpers.arrayElement(["Published", "Draft"]),
      metaTitle: faker.lorem.sentence(2),
      metaDescription: faker.lorem.sentence(3),
      visibility: faker.helpers.arrayElement([
        "Public",
        "Followers only",
        "Only me",
      ]),
      visibilityIcon:
        "https://cdn-icons-png.flaticon.com/512/12708/12708511.png",
      allowComments: faker.datatype.boolean(0.5),
      viewsCount: faker.number.int({ min: 0, max: 10 }),
      likesCount: faker.number.int({ min: 0, max: 10 }),
      publishedAt: faker.date.recent(),
      draftedAt: faker.date.between({
        from: "2022-01-01T00:00:00.000Z",
        to: "2025-06-14T00:00:00.000Z",
      }),
      createdAt: faker.date.between({
        from: "2022-01-01T00:00:00.000Z",
        to: "2025-06-14T00:00:00.000Z",
      }),

      updatedAt: faker.date.recent(),
    };

    posts.push(post);
  }
  return posts;
}

module.exports = generatePosts;
