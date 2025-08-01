const { faker } = require("@faker-js/faker");

// Cấu hình faker cho tiếng Việt (tùy chọn)
faker.locale = "vi";

async function generateRefreshTokens(count = 50, options = {}) {
  const refreshTokens = [];

  for (let i = 0; i < count; i++) {
    const refreshToken = {
      userId: faker.helpers.arrayElement(options.userIds),
      token: faker.string.alphanumeric(64),
      expiredAt: faker.date.future({ years: 1 }),
      createdAt: faker.date.between({
        from: "2022-01-01T00:00:00.000Z",
        to: "2025-06-14T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    };

    refreshTokens.push(refreshToken);
  }
  return refreshTokens;
}

module.exports = generateRefreshTokens;
