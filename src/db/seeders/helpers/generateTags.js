const { faker } = require("@faker-js/faker");
const generateUniqueSlug = require("../../../utils/generateUniqueSlug");
const getExcerptFromContent = require("./getExcerptFromContent");

// Cấu hình faker cho tiếng Việt (tùy chọn)
faker.locale = "vi";

async function generateTags() {
  const topics = [
    {
      name: "Javascript",
      createdAt: faker.date.between({
        from: "2024-01-01T00:00:00.000Z",
        to: "2025-07-11T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    },
    {
      name: "React",
      createdAt: faker.date.between({
        from: "2024-01-01T00:00:00.000Z",
        to: "2025-07-11T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    },
    {
      name: "Frontend",
      createdAt: faker.date.between({
        from: "2024-01-01T00:00:00.000Z",
        to: "2025-07-11T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    },
    {
      name: "Backend",
      createdAt: faker.date.between({
        from: "2024-01-01T00:00:00.000Z",
        to: "2025-07-11T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    },
    {
      name: "Web Development",
      createdAt: faker.date.between({
        from: "2024-01-01T00:00:00.000Z",
        to: "2025-07-11T00:00:00.000Z",
      }),

      updatedAt: faker.date.recent(),
    },
    {
      name: "Express",
      createdAt: faker.date.between({
        from: "2024-01-01T00:00:00.000Z",
        to: "2025-07-11T00:00:00.000Z",
      }),

      updatedAt: faker.date.recent(),
    },
  ];

  return topics;
}

module.exports = generateTags;
