const { faker } = require("@faker-js/faker");
const generateUniqueSlug = require("../../../utils/generateUniqueSlug");
const getExcerptFromContent = require("./getExcerptFromContent");

// Cấu hình faker cho tiếng Việt (tùy chọn)
faker.locale = "vi";

async function generateSkills() {
  const skills = [
    {
      name: "TypeScript",
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
      name: "Node.js",
      createdAt: faker.date.between({
        from: "2024-01-01T00:00:00.000Z",
        to: "2025-07-11T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    },
    {
      name: "GraphQL",
      createdAt: faker.date.between({
        from: "2024-01-01T00:00:00.000Z",
        to: "2025-07-11T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    },
    {
      name: "AWS",
      createdAt: faker.date.between({
        from: "2024-01-01T00:00:00.000Z",
        to: "2025-07-11T00:00:00.000Z",
      }),

      updatedAt: faker.date.recent(),
    },
    {
      name: "Docker",
      createdAt: faker.date.between({
        from: "2024-01-01T00:00:00.000Z",
        to: "2025-07-11T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    },
  ];

  return skills;
}

module.exports = generateSkills;
