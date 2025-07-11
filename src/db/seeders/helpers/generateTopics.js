const { faker } = require("@faker-js/faker");
const generateUniqueSlug = require("../../../utils/generateUniqueSlug");
const getExcerptFromContent = require("./getExcerptFromContent");

// Cấu hình faker cho tiếng Việt (tùy chọn)
faker.locale = "vi";

async function generateTopics() {
  const topics = [
    {
      name: "Javascript",
      slug: "javascript",
      description:
        "Everything about JavaScript programming language, frameworks, and best practices",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2ej_47AfDJI7uSQm-l21xKqWOlFtdFTyK-A&s",
      isActive: true,
      createdAt: faker.date.between({
        from: "2024-01-01T00:00:00.000Z",
        to: "2025-07-11T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    },
    {
      name: "React",
      slug: "react",
      description:
        "React.js tutorials, tips, and advanced patterns for building modern web applications",
      image: "https://img.icons8.com/emoji/512w/atom-symbol-emoji.png",
      isActive: true,
      createdAt: faker.date.between({
        from: "2024-01-01T00:00:00.000Z",
        to: "2025-07-11T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    },
    {
      name: "Node.js",
      slug: "nodejs",
      description:
        "Server-side JavaScript development with Node.js and its ecosystem",
      image: "https://www.emojiall.com/images/240/microsoft-teams/1f7e2.png",
      isActive: true,
      createdAt: faker.date.between({
        from: "2024-01-01T00:00:00.000Z",
        to: "2025-07-11T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    },
    {
      name: "CSS",
      slug: "css",
      description:
        "Modern CSS techniques, animations, and responsive design patterns",
      image: "https://images.emojiterra.com/google/android-12l/512px/1f3a8.png",
      isActive: true,
      createdAt: faker.date.between({
        from: "2024-01-01T00:00:00.000Z",
        to: "2025-07-11T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    },
    {
      name: "Typescript",
      slug: "typescript",
      description: "Type-safe JavaScript development with TypeScript",
      image:
        "https://em-content.zobj.net/source/apple/96/large-blue-diamond_1f537.png",
      isActive: true,
      createdAt: faker.date.between({
        from: "2024-01-01T00:00:00.000Z",
        to: "2025-07-11T00:00:00.000Z",
      }),

      updatedAt: faker.date.recent(),
    },
    {
      name: "Vue.js",
      slug: "vuejs",
      description:
        "Progressive JavaScript framework for building user interfaces",
      image:
        "https://symbl-cdn.com/i/webp/66/060594eadacf8667a026b46e8f7c2b.webp",
      isActive: true,
      createdAt: faker.date.between({
        from: "2024-01-01T00:00:00.000Z",
        to: "2025-07-11T00:00:00.000Z",
      }),

      updatedAt: faker.date.recent(),
    },
  ];

  return topics;
}

module.exports = generateTopics;
