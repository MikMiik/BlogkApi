const { faker } = require("@faker-js/faker");
const generateUniqueSlug = require("./generateUniqueSlug");

// Cấu hình faker cho tiếng Việt (tùy chọn)
faker.locale = "vi";

const postImages = [
  "https://images.unsplash.com/photo-1486312338219-ce68e2c6b7d3?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1519337265831-281ec6cc8514?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1535551951406-a19828b0a76b?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1484417894907-623942c8ee29?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop",
];

// Hàm tạo dữ liệu user giả
async function generatePosts(count = 100, options = {}) {
  const posts = [];
  const slugs = new Set();

  for (let i = 0; i < count; i++) {
    const title = faker.lorem.sentence();
    const post = {
      userId: faker.helpers.arrayElement(options.userIds),
      title,
      slug: generateUniqueSlug(title, slugs),
      topic: faker.helpers.arrayElements([
        "Company",
        "Product",
        "Design",
        "Engineering",
      ]),
      description: faker.lorem.sentence(2),
      content: faker.lorem.paragraphs(3),
      postImg: faker.helpers.arrayElement(postImages),
      createdAt: faker.date.between({
        from: "2022-01-01T00:00:00.000Z",
        to: "2025-06-14T00:00:00.000Z",
      }),
      publishedAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
    };

    posts.push(post);
  }
  return posts;
}

module.exports = generatePosts;
