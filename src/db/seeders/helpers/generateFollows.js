const { faker } = require("@faker-js/faker");

// Cấu hình faker cho tiếng Việt (tùy chọn)
faker.locale = "vi";

async function generateFollows(count = 300, options = {}) {
  const follows = [];
  const usedCombinations = new Set();

  for (let i = 0; i < count; i++) {
    let followerId, followedId;
    let combination;

    // Đảm bảo không tự follow và không trùng lặp
    do {
      followerId = faker.helpers.arrayElement(options.userIds);
      followedId = faker.helpers.arrayElement(options.userIds);
      combination = `${followerId}-${followedId}`;
    } while (followerId === followedId || usedCombinations.has(combination));

    usedCombinations.add(combination);

    const follow = {
      followerId,
      followedId,
      createdAt: faker.date.between({
        from: "2022-01-01T00:00:00.000Z",
        to: "2025-06-14T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    };

    follows.push(follow);
  }
  return follows;
}

module.exports = generateFollows;
