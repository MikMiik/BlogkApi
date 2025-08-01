const { faker } = require("@faker-js/faker");

// Cấu hình faker cho tiếng Việt (tùy chọn)
faker.locale = "vi";

async function generateSocials(count = 100, options = {}) {
  const socials = [];
  const platforms = [
    "Facebook",
    "Twitter",
    "Instagram",
    "LinkedIn",
    "GitHub",
    "YouTube",
    "TikTok",
  ];
  const icons = {
    Facebook: "fab fa-facebook",
    Twitter: "fab fa-twitter",
    Instagram: "fab fa-instagram",
    LinkedIn: "fab fa-linkedin",
    GitHub: "fab fa-github",
    YouTube: "fab fa-youtube",
    TikTok: "fab fa-tiktok",
  };

  for (let i = 0; i < count; i++) {
    const platform = faker.helpers.arrayElement(platforms);

    const social = {
      userId: faker.helpers.arrayElement(options.userIds),
      platform,
      url: `https://${platform.toLowerCase()}.com/user${i}`,
      icon: icons[platform],
      createdAt: faker.date.between({
        from: "2022-01-01T00:00:00.000Z",
        to: "2025-06-14T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    };

    socials.push(social);
  }
  return socials;
}

module.exports = generateSocials;
