const { faker } = require("@faker-js/faker");

// Cấu hình faker cho tiếng Việt (tùy chọn)
faker.locale = "vi";

async function generateAchievements() {
  const achievements = [
    {
      name: "Top Author",
      icon: `https://w7.pngwing.com/pngs/45/519/png-transparent-trophy-computer-icons-award-golden-cup-medal-golden-cup-objects-thumbnail.png`,
      createdAt: faker.date.between({
        from: "2024-01-01T00:00:00.000Z",
        to: "2025-07-11T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    },
    {
      name: "Early Adopter",
      icon: `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2ej_47AfDJI7uSQm-l21xKqWOlFtdFTyK-A&s`,
      createdAt: faker.date.between({
        from: "2024-01-01T00:00:00.000Z",
        to: "2025-07-11T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    },
    {
      name: "Community Helper",
      icon: `https://i.pinimg.com/736x/94/81/86/948186df370a4b1c13aa130dd84c8b40.jpg`,
      createdAt: faker.date.between({
        from: "2024-01-01T00:00:00.000Z",
        to: "2025-07-11T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    },
    {
      name: "Top Comment",
      icon: `https://cdn2.iconfinder.com/data/icons/social-media-interface-2/24/social_media_user_interface_starred_message_top_comment-512.png`,
      createdAt: faker.date.between({
        from: "2024-01-01T00:00:00.000Z",
        to: "2025-07-11T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    },
    {
      name: "Influencer",
      icon: `https://cdn-icons-png.freepik.com/512/4515/4515737.png`,
      createdAt: faker.date.between({
        from: "2024-01-01T00:00:00.000Z",
        to: "2025-07-11T00:00:00.000Z",
      }),
      updatedAt: faker.date.recent(),
    },
  ];

  return achievements;
}

module.exports = generateAchievements;
